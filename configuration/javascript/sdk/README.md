# Dapr Configuration API

In this quickstart, you'll create a microservice which makes use of Dapr's Configuration API. Configuration items are key/value pairs containing configuration data such as app ids, partition keys, database names etc. The service gets configuration items from the configuration store and subscribes for configuration updates.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/configuration/) link for more information about Dapr and Configuration API.

This quickstart includes one service:

- Node service `order-processor`

## Run order-updater app

> **Note:** `order-updater` app adds configuration items to the configuration store and keeps updating their value to simulate dynamic changes to configuration data. You need to start and keep it running before running `order-processor` service.

1. Navigate to [`order-updater`](./../../order-updater/) directory.
2. Check the [`Readme`](./../../order-updater/README.md) to start the app and keep it running in the terminal.

<!-- STEP
name: Run order-updater service
background: true
sleep: 10
timeout: 90
-->

```bash
cd ./../../order-updater
go run .
```

<!-- END_STEP -->

3. This will add configuration items to redis config store and keep updating their values.

## Run order-processor

1. Navigate to folder and install dependencies:

<!-- STEP
name: Install Node dependencies
-->

```bash
cd ./order-processor
npm install
```

<!-- END_STEP -->

1. Run the Node app with Dapr:

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP == Configuration for orderId1: {"key":"orderId1","value":'
  - '== APP == Configuration for orderId2: {"key":"orderId2","value":'
  - '== APP == Configuration update {"orderId1":{"key":"orderId1","value":'
  - '== APP == Configuration update {"orderId2":{"key":"orderId2","value":'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
match_order: none
timeout: 30
-->

```bash
cd ./order-processor
dapr run --app-id order-processor --components-path ../../../components/ --app-protocol grpc --dapr-grpc-port 3500 -- node index.js
```

<!-- END_STEP -->
