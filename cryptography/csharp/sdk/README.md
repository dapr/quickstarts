# Dapr cryptography

In this quickstart, you'll create a service that demonstrates how the Cryptography API can be readily utilized in a .NET application.
Our application will perform two operations using an RSA asymmetric key:
- Encrypt and decrypt an in-memory string value
- Encrypt and decrypt a file as a stream

Visit [this link](https://docs.dapr.io/developing-applications/building-blocks/cryptography/cryptography-overview/) for more information about the Dapr Cryptography API.

## Prerequisites

- .NET 10 SDK
- Dapr CLI and an initialized local Dapr runtime

The cryptography APIs in Dapr .NET SDK 1.19 are experimental and may change in future releases.
This sample explicitly opts in by suppressing the `DAPR_CRYPTOGRAPHY` diagnostic in its project file.

## Generating the key
This sample requires a private RSA key to be generated and placed in the `/keys` directory within the project.
While a key has been generated and distributed with this sample, the following command can be used to generate
your own key if you have OpenSSL installed on your machine:

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out keys/rsa-private-key.pem
```

> **WARNING: This RSA key is included in this project strictly for demonstration and testing purposes.**
> - Do **NOT** use this key in any production environment or for any real-world applications.
> - This key is publicly available and should be considered compromised.
> - Generating and using your own secure keys is essential for maintaining security in your projects.

## Run the quickstart
1. Open a new terminal window in this quickstart's `sdk` directory, then launch Dapr and
   the service with the following commands:

<!-- STEP
name: Run crypto service
expected_stdout_lines:
  - 'Starting Dapr with id crypto. HTTP Port:'
  - 'Encrypting string with key rsa-private-key.pem with plaintext value ''P@assw0rd'''
  - 'Decrypted string with key rsa-private-key.pem with plaintext value ''P@assw0rd'''
  - 'Encrypted string from plaintext value ''P@assw0rd'' and decrypted to ''P@assw0rd'''
  - 'Encrypted file '
  - 'Decrypting in-memory bytes to file '
  - 'and the validation check returns ''True'''
  - 'Exited App successfully'
output_match_mode: substring
match_order: none
timeout_seconds: 60
-->

```bash
cd ./cryptography
dapr run --app-id crypto --resources-path "../../../components/" -- dotnet run
```

<!-- END_STEP -->

The terminal console should show standard Dapr startup logs, and then start your application showing the
output similar to the following:

```text
Dapr sidecar is up and running.
Updating metadata for appPID: 12908
Updating metadata for app command: dotnet run
You're up and running! Both Dapr and your app logs will appear here.
== APP == info: cryptography.StringCryptographyOperations[1125053159]
== APP ==       Encrypting string with key rsa-private-key.pem with plaintext value 'P@assw0rd'
== APP == info: cryptography.StringCryptographyOperations[644187503]
== APP ==       Decrypted string with key rsa-private-key.pem with plaintext value 'P@assw0rd'
== APP == info: Program[1815579667]
== APP ==       Encrypted string from plaintext value 'P@assw0rd' and decrypted to 'P@assw0rd'
== APP == info: cryptography.StreamCryptographyOperations[855741432]
== APP ==       Encrypted file '***\AppData\Local\Temp\tmp44plip.tmp' spanning 1604 bytes
== APP == info: cryptography.StreamCryptographyOperations[880999840]
== APP ==       Decrypting in-memory bytes to file '***\AppData\Local\Temp\tmpx23nes.tmp'
== APP == info: Program[1262437064]
== APP ==       Encrypted from file stream '***\AppData\Local\Temp\tmp44plip.tmp' and decrypted back from an in-memory stream to a file '***\AppData\Local\Temp\tmpx23nes.tmp' and the validation check returns 'True'
Exited App successfully

terminated signal received: shutting down
Exited Dapr successfully
```
