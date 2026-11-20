# Dapr cryptography

In this quickstart, you'll create a service that demonstrates how the Cryptography API can be readily utilized in a .NET application.
Our application will perform two operations:
- Encrypt and decrypt an in-memory string value using an RSA key
- Encrypt and decrypt a file as a stream using a 256-bit symmetric (AES) key

These keys wrap the per-message encryption key used by Dapr's high-level Cryptography API.
The application verifies that the decrypted string and file match the originals and exits with an error if either check fails.

Visit [this link](https://docs.dapr.io/developing-applications/building-blocks/cryptography/cryptography-overview/) for more information about the Dapr Cryptography API.

## Prerequisites

- .NET 10 SDK
- Dapr CLI and an initialized local Dapr runtime
- OpenSSL

The cryptography APIs in Dapr .NET SDK 1.19 are experimental and may change in future releases.
This sample explicitly opts in by suppressing the `DAPR_CRYPTOGRAPHY` diagnostic in its project file.

## Run the quickstart

1. Open a new terminal window in this quickstart's `sdk` directory, then navigate into the
   project directory and build the application:

<!-- STEP
name: Build crypto service
-->

```bash
cd ./cryptography
dotnet build
```

<!-- END_STEP -->

2. Generate a private RSA key and a 256-bit symmetric (AES) key using OpenSSL.
   Run these commands from the `cryptography` project directory:

<!-- STEP
name: Generate keys
working_dir: cryptography
-->

```bash
mkdir -p keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out keys/rsa-private-key.pem
openssl rand -out keys/symmetric-key-256 32
```

<!-- END_STEP -->

The generated `keys` directory is ignored by Git. Do not commit these keys or use them in production.
The local storage crypto component is intended for development and testing only.

3. From the same project directory, launch Dapr and the service:

<!-- STEP
name: Run crypto service
working_dir: cryptography
expected_stdout_lines:
  - 'Starting Dapr with id crypto-quickstart. HTTP Port:'
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
dapr run --app-id crypto-quickstart --resources-path "../../../components/" -- dotnet run --no-build
```

<!-- END_STEP -->

The terminal console should show standard Dapr startup logs, followed by output similar to the following.
Temporary file paths and the encrypted byte count vary; angle-bracketed values below are placeholders:

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
== APP ==       Encrypted file '<original-temp-file>' spanning <encrypted-byte-count> bytes
== APP == info: cryptography.StreamCryptographyOperations[880999840]
== APP ==       Decrypting in-memory bytes to file '<decrypted-temp-file>'
== APP == info: Program[1262437064]
== APP ==       Encrypted from file stream '<original-temp-file>' and decrypted back from an in-memory stream to a file '<decrypted-temp-file>' and the validation check returns 'True'
Exited App successfully

terminated signal received: shutting down
Exited Dapr successfully
```

4. Stop the Dapr application if it is still running before starting another quickstart:

<!-- STEP
name: Stop crypto service
-->

```bash
dapr stop --app-id crypto-quickstart
```

<!-- END_STEP -->

The application normally exits after completing both operations and removes its temporary files.
If Dapr has already shut down, the stop command reports that it could not find the app ID; no further cleanup is needed.
