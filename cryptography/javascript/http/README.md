# Dapr cryptography (JavaScript HTTP)

In this quickstart, you'll encrypt and then decrypt data using the high-level Dapr cryptography HTTP API. The `crypto-quickstart` application uses Node.js `fetch`, without the Dapr SDK, to:

- Encrypt and decrypt a short message in a Buffer using an RSA key.
- Encrypt and decrypt `sample.txt` using Node.js streams and a 256-bit symmetric key.
- Verify that the decrypted message and file match their originals.

Visit the documentation to learn more about the [Cryptography building block](https://docs.dapr.io/developing-applications/building-blocks/cryptography/) and the [HTTP API](https://docs.dapr.io/reference/api/cryptography_api/) in Dapr.

> **Note:** HTTP cryptography is intended for development and testing. Dapr buffers HTTP crypto output even when the application uses streams, so this example uses a small file. For production or large files, use gRPC through the [SDK quickstart](../sdk/README.md), which demonstrates both SDK transports.

You need Node.js 20 or later, OpenSSL, and an [initialized Dapr CLI and runtime](https://docs.dapr.io/getting-started/install-dapr-selfhost/). The local storage component needs no external service. Dapr reads the generated keys; the application only supplies their names. These local keys are for learning, not production key management.

## Run with the multi-app template (`dapr run -f .`)

Run these steps from `cryptography/javascript/http`. Commands in parentheses run in a subshell so your terminal stays in this directory.

1. Prepare the application (there are no external npm dependencies):

<!-- STEP
name: Install Node dependencies
-->

```bash
(cd crypto-quickstart && npm install)
```

<!-- END_STEP -->

2. Generate a 4096-bit private RSA key and a 256-bit symmetric key. The shared `cryptography/components/local-storage.yaml` component reads `keys` relative to the application directory.

<!-- STEP
name: Generate keys
expected_stdout_lines:
expected_stderr_lines:
-->

```bash
mkdir -p crypto-quickstart/keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out crypto-quickstart/keys/rsa-private-key.pem
openssl rand -out crypto-quickstart/keys/symmetric-key-256 32
```

<!-- END_STEP -->

3. Run the application and its Dapr sidecar:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - "== Encrypting message using buffers"
  - "Encrypted the message"
  - "== Decrypting message using buffers"
  - "Decrypted the message, got 24 bytes"
  - 'The secret is "passw0rd"'
  - "== Encrypting message using streams"
  - "Encrypting sample.txt to encrypted.out"
  - "Encrypted the message to encrypted.out"
  - "== Decrypting message using streams"
  - "Decrypting encrypted.out to decrypted.out.txt"
  - "Decrypted the message to decrypted.out.txt"
  - "Decrypted file matches original file"
  - "HTTP round trips verified"
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 15
timeout_seconds: 60
-->

```bash
dapr run -f .
```

<!-- END_STEP -->

The app sends binary request bodies to `PUT /v1.0-alpha1/crypto/localstorage/encrypt` and `/decrypt`. Encryption headers specify `dapr-key-name` and `dapr-key-wrap-algorithm`. Decryption uses the key reference embedded in the encrypted payload.

The encrypted file is saved as `crypto-quickstart/encrypted.out` and the decrypted file as `crypto-quickstart/decrypted.out.txt`. The application checks message bytes and file SHA-256 hashes, and fails if either round trip changes the data.

4. Stop the multi-app run:

<!-- STEP
name: Stop multi-app run
sleep: 5
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->

## Run individually

After preparing the application and generating keys above, run from the application directory:

```bash
cd crypto-quickstart
dapr run --app-id crypto-http --resources-path ../../../components/ -- npm start
```

The Dapr CLI supplies `DAPR_HTTP_PORT` to the app. `DAPR_HOST` defaults to `127.0.0.1`.
