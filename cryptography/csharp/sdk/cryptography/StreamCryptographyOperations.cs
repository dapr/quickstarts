using System.Buffers;
using Dapr.Client;

namespace cryptography;

internal sealed partial class StreamCryptographyOperations(DaprClient daprClient, ILogger<StreamCryptographyOperations> logger)
{
    public async Task<string> EncryptAsync(
        string filePath,
        CancellationToken cancellationToken)
    {
        await using var sourceFile = new FileStream(filePath, FileMode.Open);
        var bufferedEncryptedBytes = new ArrayBufferWriter<byte>();
        await foreach (var bytes in (await daprClient.EncryptAsync(Constants.ComponentName, sourceFile,
                           Constants.KeyName, new EncryptionOptions(KeyWrapAlgorithm.Rsa), cancellationToken))
                       .WithCancellation(cancellationToken))
        {
            bufferedEncryptedBytes.Write(bytes.Span);
        }

        sourceFile.Close();
        
        LogEncryptFile(logger, filePath, bufferedEncryptedBytes.WrittenMemory.Span.Length);
        
        var base64String = Convert.ToBase64String(bufferedEncryptedBytes.WrittenMemory.Span);
        return base64String;
    }

    public async Task DecryptAsync(MemoryStream encryptedBytes, string decryptedFilePath, CancellationToken cancellationToken)
    {
        await using var decryptedFile = new FileStream(decryptedFilePath, FileMode.Create);
        await foreach (var bytes in (await daprClient.DecryptAsync(Constants.ComponentName, encryptedBytes,
                           Constants.KeyName, cancellationToken))
                       .WithCancellation(cancellationToken))
        {
            await decryptedFile.WriteAsync(bytes, cancellationToken);
        }

        LogDecryptFile(logger, decryptedFilePath);
        decryptedFile.Close();
    }

    [LoggerMessage(LogLevel.Information, "Encrypted file '{filePath}' spanning {encryptedByteCount} bytes")]
    static partial void LogEncryptFile(ILogger logger, string filePath, int encryptedByteCount);

    [LoggerMessage(LogLevel.Information, "Decrypting in-memory bytes to file '{filePath}'")]
    static partial void LogDecryptFile(ILogger logger, string filePath);
}