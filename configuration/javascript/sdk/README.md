# Dapr Configuration API

In this quickstart, you'll create a microservice which makes use of Dapr's Configuration API. Configuration items are key/value pairs containing configuration data such as app ids, partition keys, database names etc. The service gets configuration items from the configuration store and subscribes for configuration updates.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/configuration/) link for more information about Dapr and Configuration API.

This quickstart includes one service:

- Node service `order-processor`

## Add configuration items to the config store

### Prerequisite

- Locally running redis instance - a redis instance is automatically created as a docker container when you run `dapr init`
- Install Redis CLI - [Getting started with Redis | Redis](https://redis.io/docs/getting-started/). `redis-cli` is installed as part of redis setup
- Open a new terminal and set values for config items `orderId1` and `orderId2` using `redis-cli`

<!-- STEP
name: Add configuration items
-->

```bash
redis-cli -n 0 MSET orderId1 "101" orderId2 "102"
```

<!-- END_STEP -->

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
  - '== APP == App unsubscribed to config changes'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
match_order: none
-->

```bash
cd ./order-processor
dapr run --app-id order-processor --components-path ../../../components/ --app-protocol grpc --dapr-grpc-port 3500 -- node index.js
```

<!-- END_STEP -->

## (Optional) Update value of config items

1. Keep the `order-processor` app running and open a separate terminal
2. Change the values of `orderId1` and `orderId2` using `redis-cli`
3. `order-processor` app gets the updated values of config items

<!-- STEP
name: Update config items
-->

```bash
redis-cli -n 0 MSET orderId1 "103" orderId2 "104"
```

<!--END_STEP -->
