# Dapr cryptography (Dapr SDK)

In this quickstart, you'll create an application that encrypts, and then decrypts, data using the Dapr cryptography APIs (high-level). We will:

- Encrypt and then decrypt a short string, reading the result in-memory, in a Buffer
- Encrypt and then decrypt a large file, storing the encrypted and decrypted data to files using Node.js streams

Visit the documentation to learn more about the [Cryptography building block](https://v1-11.docs.dapr.io/developing-applications/building-blocks/cryptography/) in Dapr.

> **Note:** This example uses the Dapr SDK. Using the Dapr SDK, which leverages gRPC internally, is **strongly** recommended when using the high-level cryptography APIs (to encrypt and decrypt messages).

This quickstart includes one application:

- Node.js application `crypto-quickstart`

### Run Node.js app with Dapr

1. Navigate into the folder with the source and install dependencies:

<!-- STEP
name: Install Node dependencies
-->

```bash
cd ./crypto-quickstart
npm install
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

3. Run the Node.js app with Dapr:

<!-- STEP
name: Run Node.js app
expected_stdout_lines:
  - "== Encrypting message using buffers"
  - "Encrypted the message, got 856 bytes"
  - "== Decrypting message using buffers"
  - "Decrypted the message, got 24 bytes"
  - 'The secret is "passw0rd"'
  - "== Encrypting message using streams"
  - "Encrypting federico-di-dio-photography-Q4g0Q-eVVEg-unsplash.jpg to encrypted.out"
  - "Encrypted the message to encrypted.out"
  - "== Decrypting message using streams"
  - "Decrypting encrypted.out to decrypted.out.jpg"
  - "Decrypted the message to decrypted.out.jpg"
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
