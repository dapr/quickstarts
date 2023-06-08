# Dapr cryptography (Dapr SDK)

In this quickstart, you'll create an application that encrypts, and then decrypts, data using the Dapr cryptography APIs (high-level). We will:

- Encrypt and then decrypt a short string, reading the result in-memory, in a Buffer
- Encrypt and then decrypt a large file, storing the encrypted and decrypted data to files using Node.js streams

Visit the documentation to learn more about the [Cryptography building block](https://v1-11.docs.dapr.io/developing-applications/building-blocks/cryptography/) in Dapr.

> **Note:** This example uses the Dapr SDK. Using the Dapr SDK, which leverages gRPC internally, is **strongly** recommended when using the high-level cryptography APIs (to encrypt and decrypt messages).

This quickstart includes one application:

- Node.js application `crypto-quickstart`

### Run Node.js service with Dapr

1. Navigate into the folder with the source and install dependencies:

<!-- STEP
name: Install Node dependencies
-->

```bash
cd ./crypto-quickstart
npm ci
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

3. Run the Node.js service app with Dapr:

<!-- STEP
name: Run Node publisher
expected_stdout_lines:
  - "== APP == Saving Order:  { orderId: '1' }"
  - "== APP == Getting Order:  { orderId: '1' }"
  - "Exited App successfully"
expected_stderr_lines:
working_dir: ./crypto-quickstart
output_match_mode: substring
background: true
sleep: 10
-->

```bash
dapr run --app-id crypto-quickstart --resources-path ../../../components/ -- npm start
```

<!-- END_STEP -->
