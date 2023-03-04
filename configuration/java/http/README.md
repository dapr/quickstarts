# Dapr Configuration API

In this quickstart, you'll create a microservice which makes use of Dapr's Configuration API. Configuration items are key/value pairs containing configuration data such as app ids, partition keys, database names etc. The service gets configuration items from the configuration store and subscribes for configuration updates.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/configuration/) link for more information about Dapr and Configuration API.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

This quickstart includes one service:

- Java service `order-processor`

## Prerequisites

- [Maven 3.x](https://maven.apache.org/install.html)
- Java JDK 11 (or greater):
  - [Microsoft JDK 11](https://docs.microsoft.com/en-us/java/openjdk/download#openjdk-11)
  - [Oracle JDK 11](https://www.oracle.com/technetwork/java/javase/downloads/index.html#JDK11)
  - [OpenJDK 11](https://jdk.java.net/11/)
- Locally running redis container - a redis container named `dapr_redis` is automatically created when you run `dapr init`

## Add configuration items to the config store

- Open a new terminal and set values for config items `orderId1` and `orderId2` by using the command below

<!-- STEP
name: Add configuration items
expected_stdout_lines:
  - 'OK'
-->

```bash
docker exec dapr_redis redis-cli MSET orderId1 "101" orderId2 "102"
```

<!-- END_STEP -->

## Build the Java file

<!-- STEP
name: Build Java file
-->

```bash
cd ./order-processor
mvn clean install
```

<!-- END_STEP -->

## Run order-processor

1. Navigate to `order-processor` directory.
2. Run the service app with Dapr.

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP == Configuration for orderId1:{"orderId1":{"value":"101"}}'
  - '== APP == Configuration for orderId2:{"orderId2":{"value":"102"}}'
  - '== APP == App subscribed to config changes with subscription id:'
  - '= APP == App unsubscribed from config changes'
  - '== APP == Shutting down spring app'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
match_order: none

-->

```bash
cd ./order-processor
dapr run --app-id order-processor --app-port 6001 --resources-path ../../../components -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

<!-- END_STEP -->

## (Optional) Update value of config items

1. Keep the `order-processor` app running and open a separate terminal
2. Change the values of `orderId1` and `orderId2` using the command below
3. `order-processor` app gets the updated values of config items

<!-- STEP
name: Update config items
-->

```bash
docker exec dapr_redis redis-cli MSET orderId1 "103" orderId2 "104"
```

<!--END_STEP -->