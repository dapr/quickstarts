# Dapr pub/sub

 In this quickstart, there is a publisher microservice `checkout` and a subscriber microservice `order-processor` to demonstrate how Dapr enables a publish-subscribe pattern. `checkout` generates messages and publishes to a specific orders topic, and `order-processor` subscribers listen for messages of topic orders.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/pubsub/) link for more information about Dapr and Pub-Sub.

> **Note:** This example leverages the Dapr client SDK.  If you are looking for the example using only HTTP [click here](../http).

This quickstart includes one publisher:

- Java client message generator `checkout`

And one subscriber:

- Java subscriber `order-processor`

## Pre-requisites

* [Dapr and Dapr Cli](https://docs.dapr.io/getting-started/install-dapr/).
* Java JDK 11 (or greater): [Oracle JDK](https://www.oracle.com/technetwork/java/javase/downloads/index.html#JDK11) or [OpenJDK](https://jdk.java.net/11/).
* [Apache Maven](https://maven.apache.org/install.html) version 3.x.

### Run Java message publisher app with Dapr

1. Open a new terminal window and navigate to `checkout` directory:

```bash
cd checkout
```

2. Install dependencies:

```bash
mvn clean install
```

3. Run the Java publisher app with Dapr:

```bash
 dapr run --app-id checkout --components-path ../../../components -- java -jar target/CheckoutService-0.0.1-SNAPSHOT.jar
```

### Run Java message subscriber app with Dapr

1. Open a new terminal window and navigate to `order-processor` directory:

```bash
cd order-processor
```

2. Install dependencies:

```bash
mvn clean install
```

3. Run the Java subscriber app with Dapr:

```bash
 dapr run --app-port 8080 --app-id order-processor --components-path ../../../components -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```
