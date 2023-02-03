# Dapr state management (HTTP Client)

In this quickstart, you'll create a microservice to demonstrate Dapr's state management API. The service generates messages to store data in a state store.

Visit the Dapr documentation on [State Management](https://docs.dapr.io/developing-applications/building-blocks/state-management/) for more information.

> **Note:** This example leverages plain HTTP. You can find an example using the Dapr Client SDK (recommended) in the [`sdk` folder](../sdk/).

This quickstart includes one service: Go client service `order-processor` 

### Run Go service with Dapr

1. Run the Go service app with Dapr in the `order-processor` folder:

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP == Retrieved Order: "{\"orderId\":1}"'
  - '== APP == Retrieved Order: "{\"orderId\":2}"'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->

```bash
cd ./order-processor
dapr run --app-id order-processor --resources-path ../../../resources -- go run .
```

<!-- END_STEP -->
