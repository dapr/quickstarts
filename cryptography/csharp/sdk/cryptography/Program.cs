using System.Security.Cryptography;
using cryptography;
using Microsoft.Extensions.DependencyInjection.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprClient();
builder.Services.TryAddSingleton<StringCryptographyOperations>();
builder.Services.TryAddSingleton<StreamCryptographyOperations>();

var app = builder.Build();

var cancellationTokenSource = new CancellationTokenSource(TimeSpan.FromSeconds(30));
var logger = app.Services.GetRequiredService<ILogger<Program>>();

//Encrypt a string value
var stringOps = app.Services.GetRequiredService<StringCryptographyOperations>();
const string plaintextValue = "P@assw0rd";
var encryptedBase64String = await stringOps.EncryptAsync(plaintextValue, cancellationTokenSource.Token);
var decryptedBase64String = await stringOps.DecryptAsync(encryptedBase64String, cancellationTokenSource.Token);
Log.LogStringEncryption(logger, plaintextValue, decryptedBase64String);

//Encrypt a file
var testFilePath = await FileGenerator.GenerateSmallTestFileAsync(cancellationTokenSource.Token);
var streamOps = app.Services.GetRequiredService<StreamCryptographyOperations>();
var encryptedFileBytes = await streamOps.EncryptAsync(testFilePath, cancellationTokenSource.Token);

using var encryptedMs = new MemoryStream(Convert.FromBase64String(encryptedFileBytes));
var decryptedFilePath = Path.GetTempFileName();
await streamOps.DecryptAsync(encryptedMs, decryptedFilePath, cancellationTokenSource.Token);
var areIdentical = await FileValidator.AreIdentical(testFilePath, decryptedFilePath);
Log.LogStreamEncryption(logger, testFilePath, decryptedFilePath, areIdentical);

//Clean up the created files
File.Delete(testFilePath);
File.Delete(decryptedFilePath);

static partial class Log
{
    //It should go without saying that you should not log your plaintext values in production - this is for
    //demonstration purposes only.
    [LoggerMessage(LogLevel.Information, "Encrypted string from plaintext value '{plaintextValue}' and decrypted to '{decryptedValue}'")]
    internal static partial void LogStringEncryption(ILogger logger, string plaintextValue, string decryptedValue);

    [LoggerMessage(LogLevel.Information, "Encrypted from file stream '{plaintextFilePath}' and decrypted back from an in-memory stream to a file '{decryptedFilePath}' and the validation check returns '{areIdentical}'")]
    internal static partial void LogStreamEncryption(ILogger logger, string plaintextFilePath, string decryptedFilePath, bool areIdentical);
}

static class Constants
{
    public const string ComponentName = "localstorage";
    public const string KeyName = "rsa-private-key.pem";
}

static class FileGenerator
{
    public static async Task<string> GenerateSmallTestFileAsync(CancellationToken cancellationToken)
    {
        var tempFilePath = Path.GetTempFileName();
        await File.WriteAllTextAsync(tempFilePath, """
                                                   # The Road Not Taken
                                                   ## By Robert Lee Frost

                                                   Two roads diverged in a yellow wood,
                                                   And sorry I could not travel both
                                                   And be one traveler, long I stood
                                                   And looked down one as far as I could
                                                   To where it bent in the undergrowth;

                                                   Then took the other, as just as fair
                                                   And having perhaps the better claim,
                                                   Because it was grassy and wanted wear;
                                                   Though as for that, the passing there
                                                   Had worn them really about the same,

                                                   And both that morning equally lay
                                                   In leaves no step had trodden black
                                                   Oh, I kept the first for another day!
                                                   Yet knowing how way leads on to way,
                                                   I doubted if I should ever come back.

                                                   I shall be telling this with a sigh
                                                   Somewhere ages and ages hence:
                                                   Two roads diverged in a wood, and I,
                                                   I took the one less traveled by,
                                                   And that has made all the difference.
                                                   """, cancellationToken);

        return tempFilePath;
    }
}

static class FileValidator
{
    public static async Task<bool> AreIdentical(string path1, string path2)
    {
        await using var path1Reader = new FileStream(path1, FileMode.Open);
        await using var path2Reader = new FileStream(path2, FileMode.Open);

        using var md5 = MD5.Create();
        var file1Hash = await md5.ComputeHashAsync(path1Reader);
        var file2Hash = await md5.ComputeHashAsync(path2Reader);

        return file1Hash.SequenceEqual(file2Hash);
    }
}