# Dapr Secrets Management

In this quickstart, you'll learn how to use the Dapr Secrets Management API to retrieve secrets from a secret store.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/secrets/) link for more information about Dapr and Secrets Management.

> **Note:** This example uses HTTP requests only.  If you are looking for the example leveraging the [Dapr PHP SDK](https://docs.dapr.io/developing-applications/sdks/php/) [click here](../sdk/).

This quickstart includes one service: PHP service `order-processor`

## Run PHP service with Dapr

1. Open a new terminal window and install dependencies:

<!-- STEP
name: Install PHP dependencies
-->

```bash
composer install
```

<!-- END_STEP -->

2. Run the PHP service app with Dapr:

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - 'Fetched Secret: {"secret":"YourPasskeyHere"}'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->

```bash
cd ./order-processor
dapr run --app-id order-processor --resources-path ../../../components/ -- php app.php
```

<!-- END_STEP -->

```bash
dapr stop --app-id order-processor
```
