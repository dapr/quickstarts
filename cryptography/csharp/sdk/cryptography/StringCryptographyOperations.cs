using System.Text;
using Dapr.Client;

namespace cryptography;

internal sealed partial class StringCryptographyOperations(DaprClient daprClient, ILogger<StringCryptographyOperations> logger)
{
    public async Task<string> EncryptAsync(string plaintextValue, CancellationToken cancellationToken)
    {
        var plaintextBytes = Encoding.UTF8.GetBytes(plaintextValue);
        var encryptedBytes = await daprClient.EncryptAsync(Constants.ComponentName, plaintextBytes, Constants.KeyName, new EncryptionOptions(KeyWrapAlgorithm.Rsa), cancellationToken);
        LogEncryptionOperation(logger, Constants.KeyName, plaintextValue);
        return Convert.ToBase64String(encryptedBytes.Span);
    }

    public async Task<string> DecryptAsync(string base64EncryptedValue, CancellationToken cancellationToken)
    {
        var ciphertextBytes = Convert.FromBase64String(base64EncryptedValue);
        var decryptedBytes =
            await daprClient.DecryptAsync(Constants.ComponentName, ciphertextBytes, Constants.KeyName, cancellationToken);
        var plaintextValue = Encoding.UTF8.GetString(decryptedBytes.Span);
        LogDecryptionOperation(logger, Constants.KeyName, plaintextValue);
        return plaintextValue;
    }
    
    [LoggerMessage(LogLevel.Information, "Encrypting string with key {keyName} with plaintext value '{plaintextValue}'")]
    static partial void LogEncryptionOperation(ILogger logger, string keyName, string plaintextValue);

    [LoggerMessage(LogLevel.Information, "Decrypted string with key {keyName} with plaintext value '{plaintextValue}'")]
    static partial void LogDecryptionOperation(ILogger logger, string keyName, string plaintextValue);
}