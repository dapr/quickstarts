# Dapr service-invocation

In this quickstart, you'll create a Checkout microservice and a OrderProcessor microservice to demonstrate how Dapr performs service invocation. The Checkout service acts as a client application and it invokes a method/api exposed via OrderProcessing application.
See [Why Service Invocation](#why-service-invocation) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/) link for more information about Dapr and service-invocation.

> **Note:** This example leverages HTTPClient only.  If you are looking for the example using the Dapr Client SDK [click here](../sdk).

This quickstart includes:

- `OrderProcessingService` Exposes a method/api to be remotely accessed.
- `CheckoutService` Invokes the method exposed by `OrderProcessingService`

## Pre-requisites

* [Dapr and Dapr Cli](https://docs.dapr.io/getting-started/install-dapr/).
* Java JDK 11 (or greater): [Oracle JDK](https://www.oracle.com/technetwork/java/javase/downloads/index.html#JDK11) or [OpenJDK](https://jdk.java.net/11/).
* [Apache Maven](https://maven.apache.org/install.html) version 3.x.

### Run OrderProcessingService app with Dapr

1. Open a new terminal window and navigate to `order-processor` directory:

```bash
cd order-processor
```

2. Install dependencies:

```bash
mvn clean install
```

3. Run the Java publisher app with Dapr:

```bash
 dapr run --app-id orderapp --app-port 8080 --dapr-http-port 3500 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

### Run CheckoutService with Dapr

1. Open a new terminal window and navigate to `checkout` directory:

```bash
cd checkout
```

2. Install dependencies:

```bash
mvn clean install
```

3. Run the Java subscriber app with Dapr:

```bash
 dapr run --app-id checkout -- java -jar target/CheckoutService-0.0.1-SNAPSHOT.jar
```
