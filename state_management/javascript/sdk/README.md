# Dapr state management (SDK Client)

In this quickstart, you'll use the Dapr JavaScript SDK to save, get, and delete orders in a state store, then delete multiple orders with `client.state.deleteBulk`.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/state-management/) link for more information about Dapr and State Management.

> **Note:** This example uses the Dapr Client SDK. For the equivalent example using only HTTP requests, [click here](../http/).

This quickstart includes one Node.js service, `order-processor`, and pins `@dapr/dapr` to `3.19.0`.

The service saves, gets, and deletes 100 individual orders. It then saves two orders, `bulk-1` and `bulk-2`, checks that they exist, and passes their keys to `client.state.deleteBulk`. Finally, it reads both keys again and checks that they are absent before printing `Bulk orders deleted: bulk-1, bulk-2`. Any failed operation or check makes the app exit with an error.

Bulk deletion is not a transaction. The SDK uses parallel per-key DELETE requests over HTTP (the default transport), because Dapr has no HTTP bulk-delete endpoint. With `DAPR_PROTOCOL=grpc`, it uses Dapr's `DeleteBulkState` RPC instead.

## Run with the multi-app template

Start with [Dapr initialized locally](https://docs.dapr.io/getting-started/install-dapr-cli/), its default Redis container running, and Node.js 22 or later installed. Run these commands from this README's directory.

1. Install the Node.js dependencies:

<!-- STEP
name: Install Node Dependencies
-->

```bash
cd ./order-processor
npm ci
cd ..
```

<!-- END_STEP -->

2. Run the Node service app with Dapr:

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - "Saving Order:  { orderId: '1' }"
  - "Getting Order:  { orderId: '1' }"
  - "Deleting Order:  { orderId: '1' }"
  - "Saving bulk orders: bulk-1, bulk-2"
  - "Bulk orders deleted: bulk-1, bulk-2"
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 60
timeout_seconds: 90
-->

```bash
dapr run -f .
```

<!-- END_STEP -->

The complete sample takes about 50 seconds. The validated output includes both the original single-order operations and the bulk-delete checks.

3. Stop and clean up the application:

<!-- STEP
name: Stop order-processor service
-->

```bash
dapr stop -f .
```
<!-- END_STEP -->

## Run individually (optional)

After installing dependencies, you can launch the app without the multi-app template:

```bash
cd ./order-processor
dapr run --app-id order-processor-sdk --resources-path ../../../resources/ -- npm start
```

To use the gRPC transport instead, set `DAPR_PROTOCOL=grpc` in your shell before running the app. For example, in Bash:

```bash
DAPR_PROTOCOL=grpc dapr run --app-id order-processor-sdk --resources-path ../../../resources/ -- npm start
```

Stop the app from another terminal if it is still running:

```bash
dapr stop --app-id order-processor-sdk
```
