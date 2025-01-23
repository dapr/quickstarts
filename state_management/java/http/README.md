# Dapr state management (HTTP Client)

In this quickstart, there is a `order-processor` microservice to demonstrate Dapr's state management API. The service generates messages to store in a state store.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/state-management/) link for more information about Dapr and State Management.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

## Pre-requisites

* [Dapr and Dapr Cli](https://docs.dapr.io/getting-started/install-dapr-cli/).
* Java JDK 17 (or greater):
  * [Microsoft JDK 17](https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-17)
  * [Oracle JDK 17](https://www.oracle.com/java/technologies/downloads/?er=221886#java17)
  * [OpenJDK 17](https://jdk.java.net/17/)
* [Apache Maven](https://maven.apache.org/install.html) version 3.x.

This quickstart includes one service: Java client service `order-processor`

## Run multiple apps with multi-app run template file

This section shows how to run applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.

Open a new terminal window and run  `order-processor` using the multi app run template defined in [dapr.yaml](./dapr.yaml):

### Run Java service with Dapr

1. Open a new terminal window and navigate to `order-processor` directory:

<!-- STEP
name: Build Java file
-->

```bash
  cd ./order-processor
  mvn clean install
  cd ..
```

<!-- END_STEP -->

2. Run the Java service app with Dapr:

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP - order-processor == Saving order: 1'
  - '== APP - order-processor == Order saved: {"orderId":1}'
  - '== APP - order-processor == Deleting order: 1'
  - '== APP - order-processor == Deletion Status code :204'
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 60
-->

```bash
  dapr run -f .
```

3. Stop and cleanup application process

```bash
dapr stop -f .
```
<!-- END_STEP -->

## Run a single app at a time with Dapr (Optional)

1. Open a new terminal window and navigate to `order-processor` directory:

<!-- STEP
name: Build Java file
-->

```bash
cd ./order-processor
mvn clean install
cd ..
```

<!-- END_STEP -->
2. Run the Java service app with Dapr: 

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP == Saving order: 1'
  - '== APP == Order saved: {"orderId":1}'
  - '== APP == Deleting order: 1'
  - '== APP == Deletion Status code :204'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 60
-->

```bash
cd ./order-processor
dapr run --app-id order-processor --resources-path ../../../resources/ -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```
<!-- END_STEP -->

3. Stop and cleanup application process

```bash
dapr stop --app-id order-processor
```
