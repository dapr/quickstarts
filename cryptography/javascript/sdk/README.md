# Dapr cryptography (JavaScript SDK)

In this quickstart, you'll encrypt and then decrypt data using the high-level Dapr cryptography APIs and JavaScript SDK 3.19.0. The `crypto-quickstart` application demonstrates the same operations first over gRPC, then over HTTP:

- Encrypt and decrypt a short message in a Buffer using an RSA key.
- Encrypt and decrypt the bundled photo using Node.js streams and a 256-bit symmetric key.
- Verify that the decrypted message and file match their originals.

Visit the documentation to learn more about the [Cryptography building block](https://docs.dapr.io/developing-applications/building-blocks/cryptography/) in Dapr.

> **Note:** Both SDK transports support Buffer and stream overloads. gRPC is strongly recommended for production and large files: Dapr buffers HTTP crypto output even when the application uses streams. For direct HTTP requests without the SDK, see the [HTTP quickstart](../http/README.md).

You need Node.js 20 or later, OpenSSL, and an [initialized Dapr CLI and runtime](https://docs.dapr.io/getting-started/install-dapr-selfhost/). The local storage component needs no external service. Dapr reads the generated keys; the application only supplies their names. These local keys are for learning, not production key management.

## Run with the multi-app template (`dapr run -f .`)

Run these steps from `cryptography/javascript/sdk`. Commands in parentheses run in a subshell so your terminal stays in this directory.

1. Install the application's dependencies:

<!-- STEP
name: Install Node dependencies
-->

```bash
(cd crypto-quickstart && npm install)
```

<!-- END_STEP -->

2. Generate a 4096-bit private RSA key and a 256-bit symmetric key. Both transports use the shared `cryptography/components/local-storage.yaml` component, which reads `keys` relative to the application directory.

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
  - "== Using gRPC"
  - "== Encrypting message using buffers"
  - "Encrypted the message"
  - "== Decrypting message using buffers"
  - "Decrypted the message, got 24 bytes"
  - 'The secret is "passw0rd"'
  - "== Encrypting message using streams"
  - "Encrypting federico-di-dio-photography-Q4g0Q-eVVEg-unsplash.jpg to encrypted.out"
  - "Encrypted the message to encrypted.out"
  - "== Decrypting message using streams"
  - "Decrypting encrypted.out to decrypted.out.jpg"
  - "Decrypted the message to decrypted.out.jpg"
  - "Decrypted file matches original file"
  - "gRPC round trips verified"
  - "== Using HTTP"
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

The output shows the message and file round trips for each transport. Operations run sequentially, not concurrently. The HTTP pass overwrites `crypto-quickstart/encrypted.out` and `crypto-quickstart/decrypted.out.jpg` from the gRPC pass. The application checks message bytes and file SHA-256 hashes, and fails if either round trip changes the data.

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

After installing dependencies and generating keys above, run from the application directory:

```bash
cd crypto-quickstart
dapr run --app-id crypto --resources-path ../../../components/ -- npm start
```

The Dapr CLI supplies `DAPR_GRPC_PORT` and `DAPR_HTTP_PORT` to the app. Both transports run against the same sidecar.
