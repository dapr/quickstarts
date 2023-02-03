# Dapr secrets management (HTTP Client)

In this quickstart, you'll create a microservice to demonstrate Dapr's secrets management API. The service fetches secret from a secret store. See [Why secrets management](#why-secrets-management) to understand when to use this API.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/secrets/) link for more information about Dapr and Secrets Management.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

This quickstart includes one service:

- Dotnet client service `order-processor` 

### Run Dotnet service with Dapr

1. Open a new terminal window and navigate to `order-processor` directory: 

<!-- STEP
name: Install Dotnet dependencies
-->

```bash
cd ./order-processor
dotnet restore
dotnet build
```

<!-- END_STEP -->
2. Run the Dotnet service app with Dapr: 

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP == Fetched Secret: {"secret":"YourPasskeyHere"}'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
-->
    
```bash
cd ./order-processor
dapr run --app-id order-processor --resources-path ../../../components/ -- dotnet run
```

<!-- END_STEP -->

```bash
dapr stop --app-id order-processor
```
