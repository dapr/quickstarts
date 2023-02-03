# Dapr state management (HTTP Client)

In this quickstart, there is a `order-processor` microservice to demonstrate Dapr's state management API. The service generates messages to store in a state store.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/state-management/) link for more information about Dapr and State Management.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

## Pre-requisites

* [Dapr and Dapr Cli](https://docs.dapr.io/getting-started/install-dapr-cli/).
* Java JDK 11 (or greater):
    * [Microsoft JDK 11](https://docs.microsoft.com/en-us/java/openjdk/download#openjdk-11)
    * [Oracle JDK 11](https://www.oracle.com/technetwork/java/javase/downloads/index.html#JDK11)
    * [OpenJDK 11](https://jdk.java.net/11/)
* [Apache Maven](https://maven.apache.org/install.html) version 3.x.

This quickstart includes one service:

- Java client service `order-processor`

### Run Java service with Dapr

1. Open a new terminal window and navigate to `order-processor` directory:

<!-- STEP
name: Build Java file
-->

```bash
cd ./order-processor
mvn clean install
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
sleep: 15
-->
    
```bash
cd ./order-processor
dapr run --app-id order-processor --resources-path ../../../resources/ -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

<!-- END_STEP -->

```bash
dapr stop --app-id order-processor
```
