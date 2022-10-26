# Dapr Configuration API 

In this quickstart, you'll create a microservice which makes use of Dapr's Configuration API. Configuration items are key/value pairs containing configuration data such as app ids, partition keys, database names etc. The service gets configuration items from the configuration store and subscribes for configuration updates.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/configuration/) link for more information about Dapr and Configuration API.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

This quickstart includes one service:

- Go service `config-subscriber`

## Run config-updater app

> **Note:** `config-updater` app adds configuration items to the configuration store and keeps updating their value to simulate dynamic changes to configuration data. You need to start and keep it running before running `config-subscriber` service.

1. Navigate to [`config-updater`](./../../config-updater/) directory.
2. Check the [`Readme`](./../../config-updater/README.md) to start the app and keep it running in the terminal.

```bash
cd ./../../config-updater
go run .
```

3. This will add configuration items to redis config store and keep updating their values.

## Run config-subscriber

1. Open a new terminal and navigate to `config-subscriber` directory.
2. Run the service app with Dapr.

<!-- STEP
name: Run config-subscriber service
expected_stdout_lines:
  - '== APP == Configuration for appID1: {"appID1":{"value":'
  - '== APP == Configuration for appID2: {"appID2":{"value":'
  - '== APP == App subscribed to config changes with subscription id:'
  - '== APP == Configuration update {"appID1":{"value":'
  - '== APP == Configuration update {"appID2":{"value":'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 20
-->

```bash
cd ./config-subscriber
dapr run --app-id config-subscriber --app-port 6001 --components-path ../../../components -- go run .
```

<!-- END_STEP -->