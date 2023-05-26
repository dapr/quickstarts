# Fixtures

This folder contains fixtures used by the quickstarts:

- `keys/`: contains keys used to encrypt/decrypt data
  - `rsa-private-key.pem`: RSA private key, in PEM format (PKCS#8)  
    > This was generated with `openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:4096`
  - `symmetric-key-256.b64`: 256-bit symmetric key, base64-encoded  
    > This was generated with `openssl rand -base64 32`

> **Important:** These keys are provided as example, and are here included in plain-text for the world to see. Do not use these keys in your own applications!
