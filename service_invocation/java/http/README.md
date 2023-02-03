# Service Invocation

In this quickstart, you'll create a checkout service and an order processor service to demonstrate how to use the service invocation API. The checkout service uses Dapr's http proxying capability to invoke a method on the order processing service.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/) link for more information about Dapr and service invocation.

This quickstart includes one checkout service:

- Java client service `checkout`

And one order processor service:

- Java order-processor service `order-processor`

## Pre-requisites

* [Dapr and Dapr Cli](https://docs.dapr.io/getting-started/install-dapr-cli/).
* Java JDK 11 (or greater):
    * [Microsoft JDK 11](https://docs.microsoft.com/en-us/java/openjdk/download#openjdk-11)
    * [Oracle JDK 11](https://www.oracle.com/technetwork/java/javase/downloads/index.html#JDK11)
    * [OpenJDK 11](https://jdk.java.net/11/)
* [Apache Maven](https://maven.apache.org/install.html) version 3.x.

### Run Java order-processor with Dapr

1. Open a new terminal window and navigate to `order-processor` directory and install dependencies:

<!-- STEP
name: Install maven dependencies
-->

```bash
cd ./order-processor
mvn clean install
```
<!-- END_STEP -->

2. Run the Java order-processor app with Dapr:

<!-- STEP
name: Run Java order-processor service
expected_stdout_lines:
  - "== APP == Order received: 1"
  - "== APP == Order received: 2"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 10
-->

```bash
cd ./order-processor
dapr run --app-id order-processor --app-port 9001 --app-protocol http --dapr-http-port 3501 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

<!-- END_STEP -->

### Run Java checkout service with Dapr

1. Open a new terminal window and navigate to `checkout` directory and install dependencies:

<!-- STEP
name: Install maven dependencies
-->

```bash
cd ./checkout
mvn clean install
```
<!-- END_STEP -->

2. Run the Java checkout app with Dapr:

<!-- STEP
name: Run Java checkout service
expected_stdout_lines:
  - "== APP == Order passed: 1"
  - "== APP == Order passed: 2"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->

```bash
cd ./checkout
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- java -jar target/CheckoutService-0.0.1-SNAPSHOT.jar
```

<!-- END_STEP -->

```bash
dapr stop --app-id checkout
dapr stop --app-id order-processor
```

### Start all apps with multi app run template file:

1. Open a new terminal window and install dependencies for `order-processor` and `checkout` apps:

<!-- STEP
name: Install maven dependencies for order-processor and checkout
-->

```bash
cd ./order-processor
mvn clean install
cd ../checkout
mvn clean install
```

<!-- END_STEP -->

2. Run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'This is a preview feature and subject to change in future releases'
  - 'Validating config and starting app "order-processor"'
  - 'Started Dapr with app id "order-processor"'
  - 'Writing log files to directory'
  - 'Validating config and starting app "checkout"'
  - 'Started Dapr with app id "checkout"'
  - 'Writing log files to directory'
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->

```bash
sleep 10
dapr run -f .
```

<!-- END_STEP -->

```bash
dapr stop -f .
```
