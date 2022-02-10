# Dapr pub/sub

In this quickstart, you'll create a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a publish-subcribe pattern. The publisher will generate messages of a specific topic, while subscribers will listen for messages of specific topics. See [Why Pub-Sub](#why-pub-sub) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/pubsub/) link for more information about Dapr and Pub-Sub.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

This quickstart includes one publisher:

- Java client message generator `checkout`

And one subscriber:

- Java subscriber `order-processor`

## Pre-requisites

* [Dapr and Dapr Cli](https://docs.dapr.io/getting-started/install-dapr/).
* Java JDK 11 (or greater): [Oracle JDK](https://www.oracle.com/technetwork/java/javase/downloads/index.html#JDK11) or [OpenJDK](https://jdk.java.net/13/).
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

1. Open a new terminal window and navigate to `checkout` directory:

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
