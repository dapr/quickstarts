# Dapr secrets management (HTTP Client)

In this quickstart, you'll create a microservice to demonstrate Dapr's secrets management API. The service fetches secret from a secret store. See [Why secrets management](#why-secrets-management) to understand when to use this API.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/secrets/) link for more information about Dapr and Secrets Management.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

This quickstart includes one service:

- Node client service `order-processor` 

### Run Node service with Dapr

1. Navigate to folder and install dependencies: 

<!-- STEP
name: Install Node dependencies
-->

```bash
cd ./order-processor
npm install
```
<!-- END_STEP -->

2. Run the Node service app with Dapr: 
    
<!-- STEP
name: Run Node publisher
expected_stdout_lines:
  - "== APP == Fetched Secret:  { secret: 'YourPasskeyHere' }"
  - "Exited App successfully"
expected_stderr_lines:
working_dir: ./order-processor
output_match_mode: substring
-->

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- npm start
```

<!-- END_STEP -->

```bash
dapr stop --app-id order-processor
```
