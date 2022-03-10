# Dapr state management (HTTP Client)

In this quickstart, there is a `order-processor` microservice to demonstrate Dapr's state management API. The service generates messages to store in a state store.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/state-management/) link for more information about Dapr and State Management.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

## Pre-requisites

* [Dapr and Dapr Cli](https://docs.dapr.io/getting-started/install-dapr/).
* Java JDK 11 (or greater):
    * [Microsoft JDK 11](https://docs.microsoft.com/en-us/java/openjdk/download#openjdk-11)
    * [Oracle JDK 11](https://www.oracle.com/technetwork/java/javase/downloads/index.html#JDK11)
    * [OpenJDK 11](https://jdk.java.net/11/)
* [Apache Maven](https://maven.apache.org/install.html) version 3.x.

This quickstart includes one service:

- Java client service `order-processor`

### Run Java service with Dapr

1. Open a new terminal window and navigate to `order-processor` directory:

```bash
cd order-processor
```

2. Install dependencies:

```bash
mvn clean install
```

3. Run the Java service app with Dapr:

```bash
dapr run --app-id order-processor --components-path ../../../components/ -- java -jar target/order-processor-0.0.1-SNAPSHOT.jar
```
