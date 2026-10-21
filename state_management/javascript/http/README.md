# Dapr state management (HTTP Client)

In this quickstart, you'll use HTTP requests to save, get, and delete orders in a Dapr state store, then delete multiple orders.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/state-management/) link for more information about Dapr and State Management.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

This quickstart includes one Node.js service, `order-processor`, using Axios without a Dapr SDK dependency.

The service saves, gets, and deletes 100 individual orders. It then saves two orders, `bulk-1` and `bulk-2`, and checks that they exist. Dapr has no HTTP bulk-delete endpoint, so it deletes each key in parallel with `Promise.all` and `DELETE /v1.0/state/statestore/{key}`. This matches the HTTP behavior of `client.state.deleteBulk` in the [SDK sample](../sdk/); it is not a transaction.

Finally, the service reads both keys again and checks for HTTP `204 No Content` before printing `Bulk orders deleted: bulk-1, bulk-2`. Any failed request or check makes the app exit with an error.

## Run with the multi-app template

Start with [Dapr initialized locally](https://docs.dapr.io/getting-started/install-dapr-cli/), its default Redis container running, and Node.js 22 or later installed. Run these commands from this README's directory.

1. Install the Node.js dependencies:

<!-- STEP
name: Install Node dependencies
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
dapr run --app-id order-processor-http --resources-path ../../../resources/ -- npm start
```

Stop the app from another terminal if it is still running:

```bash
dapr stop --app-id order-processor-http
```
