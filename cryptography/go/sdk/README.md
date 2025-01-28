# Dapr cryptography (Dapr SDK)

In this quickstart, you'll create an application that encrypts, and then decrypts, data using the Dapr cryptography APIs (high-level). We will:

- Encrypt and then decrypt a short string, reading the result in-memory, in a Go byte slice
- Encrypt and then decrypt a large file, storing the encrypted and decrypted data to files using streams

Visit the documentation to learn more about the [Cryptography building block](https://v1-11.docs.dapr.io/developing-applications/building-blocks/cryptography/) in Dapr.

> **Note:** This example uses the Dapr SDK. Using the Dapr SDK, which leverages gRPC internally, is **strongly** recommended when using the high-level cryptography APIs (to encrypt and decrypt messages).

This quickstart includes one application:

- Go application `crypto-quickstart`

### Run Go service with Dapr

> In order to run this sample, make sure that OpenSSL is available on your system.

1. Navigate into the folder with the source code:

<!-- STEP
name: Navigate into folder
expected_stdout_lines:
expected_stderr_lines:
-->

```bash
cd ./crypto-quickstart
```

<!-- END_STEP -->

2. This sample requires a private RSA key and a 256-bit symmetric (AES) key. We will generate them using OpenSSL:

<!-- STEP
name: Generate keys
working_dir: crypto-quickstart
expected_stdout_lines:
expected_stderr_lines:
-->

```bash
mkdir -p keys
# Generate a private RSA key, 4096-bit keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out keys/rsa-private-key.pem
# Generate a 256-bit key for AES
openssl rand -out keys/symmetric-key-256 32
```

<!-- END_STEP -->

3. Run the Go service app with Dapr:

<!-- STEP
name: Run order-processor service
working_dir: crypto-quickstart
expected_stdout_lines:
  - '== APP == Encrypted the message, got 856 bytes'
  - '== APP == Decrypted the message, got 24 bytes'
  - '== APP == The secret is "passw0rd"'
  - '== APP == Wrote decrypted data to encrypted.out'
  - '== APP == Wrote decrypted data to decrypted.out.jpg'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
-->

```bash
dapr run --app-id crypto-quickstart --resources-path ../../../components/ -- go run .
```

<!-- END_STEP -->
