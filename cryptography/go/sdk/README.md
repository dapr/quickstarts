# Dapr secrets management (Dapr SDK)

In this quickstart, you'll create an application that encrypts, and then decrypts, a short message and a large file using the Dapr cryptography APIs (high-level).

Visit the documentation to learn more about the [Cryptography building block](https://docs.dapr.io/developing-applications/building-blocks/cryptography/) in Dapr.

> **Note:** This example uses the Dapr SDK. Using the Dapr SDK, which leverages gRPC internally, is **strongly** recommended when using the high-level cryptography APIs (to encrypt and decrypt messages).

This quickstart includes one application:

- Go application `crypto-quickstart`

### Run Go service with Dapr

1. Run the Go service app with Dapr:

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP == Encrypted the message, got 918 bytes'
  - '== APP == Salvatore Quasimodo wrote:'
  - '== APP == Ognuno sta solo sul cuor della terra'
  - '== APP == trafitto da un raggio di sole:'
  - '== APP == ed è subito sera.'
  - '== APP == Wrote decrypted data to encrypted.out'
  - '== APP == Wrote decrypted data to decrypted.out.jpg'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
-->

```bash
cd ./crypto-quickstart
dapr run --app-id crypto-quickstart --resources-path ../../../components/ -- go run .
```

<!-- END_STEP -->
