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

1. Install dependencies:

<!-- STEP
name: Install Java dependencies
-->

```bash
cd pub_sub/java/http/checkout
mvn clean install
```
<!-- END_STEP -->

2. Run the Java publisher app with Dapr:
<!-- STEP
name: Run Java publisher
expected_stdout_lines:
  - "You're up and running! Both Dapr and your app logs will appear here."
  - 'Published data: 1'
  - 'Published data: 2'
  - "Exited App successfully"
  - "Exited Dapr successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 10
-->

```bash
 dapr run --app-id checkout --components-path pub_sub/components -- java -jar pub_sub/java/http/checkout/target/CheckoutService-0.0.1-SNAPSHOT.jar
```
<!-- END_STEP -->

### Run Java message subscriber app with Dapr


1. Navigate to the directory and install dependencies:

<!-- STEP
name: Install Java dependencies
-->

```bash
cd ./checkout
mvn clean install
```
<!-- END_STEP -->

2. Run the Java publisher app with Dapr:
<!-- STEP
name: Run Java publisher
working_dir: ./checkout
expected_stdout_lines:
  - "You're up and running! Both Dapr and your app logs will appear here."
  - 'Published data: 1'
  - 'Published data: 2'
  - "Exited App successfully"
  - "Exited Dapr successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 10
-->

```bash
 dapr run --app-id checkout --components-path ../../components -- java -jar target/CheckoutService-0.0.1-SNAPSHOT.jar
```
<!-- END_STEP -->

### Run Java message subscriber app with Dapr


1. Navigate to directory and install dependencies:
<!-- STEP
name: Install Java dependencies
-->

```bash
cd ./order-processor
mvn clean install
```
<!-- END_STEP -->

2. Run the Java subscriber app with Dapr:
<!-- STEP
name: Run Java publisher
working_dir: ./order-processor
expected_stdout_lines:
  - "You're up and running! Both Dapr and your app logs will appear here."
  - 'Subscriber received: 2'
  - "Exited Dapr successfully"
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 10
-->
```bash
 dapr run --app-port 8080 --app-id order-processor --components-path ../../components -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```
<!-- END_STEP -->