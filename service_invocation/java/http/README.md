# Service Invocation

In this quickstart, you'll create a checkout service and an order processor service to demonstrate how to use the service invocation API. The checkout service uses Dapr's http proxying capability to invoke a method on the order processing service.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/) link for more information about Dapr and service invocation.

This quickstart includes one checkout service:

- Java client service `checkout`

And one order processor service:

- Java order-processor service `order-processor`

## Pre-requisites

* [Dapr and Dapr Cli](https://docs.dapr.io/getting-started/install-dapr/).
* Java JDK 11 (or greater):
    * [Microsoft JDK 11](https://docs.microsoft.com/en-us/java/openjdk/download#openjdk-11)
    * [Oracle JDK 11](https://www.oracle.com/technetwork/java/javase/downloads/index.html#JDK11)
    * [OpenJDK 11](https://jdk.java.net/11/)
* [Apache Maven](https://maven.apache.org/install.html) version 3.x.

### Run Java checkout service with Dapr

1. Open a new terminal window and navigate to `checkout` directory:

```bash
cd checkout
```

2. Install dependencies:

<!-- STEP
name: Install maven dependencies
working_dir: ./checkout
-->

```bash
mvn clean install
```

3. Run the Java checkout app with Dapr:

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
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- java -jar target/CheckoutService-0.0.1-SNAPSHOT.jar
```

<!-- END_STEP -->

### Run Java order-processor with Dapr

1. Open a new terminal window and navigate to `order-processor` directory:

```bash
cd order-processor
```

2. Install dependencies:

<!-- STEP
name: Install maven dependencies
working_dir: ./order-processor
-->

```bash
mvn clean install
```
<!-- END_STEP -->
3. Run the Java order-processor app with Dapr:

<!-- STEP
name: Run Java checkout service
expected_stdout_lines:
  - "== APP == Order received: 1"
  - "== APP == Order received: 2"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 10
-->

```bash
dapr run --app-id order-processor --app-port 6001 --app-protocol http --dapr-http-port 3501 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

<!-- END_STEP -->

