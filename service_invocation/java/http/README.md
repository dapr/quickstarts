# Service Invocation

In this quickstart, you'll create a checkout service and an order processor service to demonstrate how to use the service invocation API. The checkout service uses Dapr's http proxying capability to invoke a method on the order processing service.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/) link for more information about Dapr and service invocation.

This quickstart includes one checkout service:

- Java client service `checkout`

And one order processor service:

- Java order-processor service `order-processor`

## Pre-requisites

* [Dapr and Dapr Cli](https://docs.dapr.io/getting-started/install-dapr-cli/).
* Java JDK 17 (or greater):
  * [Microsoft JDK 17](https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-17)
  * [Oracle JDK 17](https://www.oracle.com/java/technologies/downloads/?er=221886#java17)
  * [OpenJDK 17](https://jdk.java.net/17/)
* [Apache Maven](https://maven.apache.org/install.html) version 3.x.

## Run all apps with multi-app run template file:

This section shows how to run both applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.  

1. Open a new terminal window and install dependencies for `order-processor` and `checkout` apps:

<!-- STEP
name: Install maven dependencies for order-processor and checkout
-->

```bash
cd ./order-processor
mvn clean install
cd ../checkout
mvn clean install
cd ..
```

<!-- END_STEP -->

2. Run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Validating config and starting app "order-processor"'
  - 'Started Dapr with app id "order-processor"'
  - 'Writing log files to directory'
  - 'Validating config and starting app "checkout"'
  - 'Started Dapr with app id "checkout"'
  - 'Writing log files to directory'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 15
timeout_seconds: 30
-->

```bash
dapr run -f .
```

The terminal console output should look similar to this:

```text
== APP - order-processor == Order received: 1
== APP - checkout == Order passed: 1
== APP - order-processor == Order received: 2
== APP - checkout == Order passed: 2
== APP - order-processor == Order received: 3
== APP - checkout == Order passed: 3
== APP - order-processor == Order received: 4
== APP - checkout == Order passed: 4
== APP - order-processor == Order received: 5
== APP - checkout == Order passed: 5
== APP - order-processor == Order received: 6
== APP - checkout == Order passed: 6
== APP - order-processor == Order received: 7
== APP - checkout == Order passed: 7
== APP - order-processor == Order received: 8
== APP - checkout == Order passed: 8
== APP - order-processor == Order received: 9
== APP - checkout == Order passed: 9
== APP - order-processor == Order received: 10
== APP - checkout == Order passed: 10
== APP - order-processor == Order received: 11
== APP - checkout == Order passed: 11
== APP - order-processor == Order received: 12
== APP - checkout == Order passed: 12
```

3. Stop and clean up application processes

```bash
dapr stop -f .
```
<!-- END_STEP -->

## Run a single app at a time with Dapr (Optional)

An alternative to running all or multiple applications at once is to run single apps one-at-a-time using multiple `dapr run .. -- java -jar` commands.  This next section covers how to do this. 

### Run Java order-processor with Dapr

1. Open a new terminal window and navigate to `order-processor` directory and install dependencies:

```bash
cd ./order-processor
mvn clean install
```

2. Run the Java order-processor app with Dapr:

```bash
dapr run --app-id order-processor --app-port 9001 --app-protocol http --dapr-http-port 3501 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

### Run Java checkout service with Dapr

1. Open a new terminal window and navigate to `checkout` directory and install dependencies:

```bash
cd ./checkout
mvn clean install
```

2. Run the Java checkout app with Dapr:

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- java -jar target/CheckoutService-0.0.1-SNAPSHOT.jar
```

### Stop and clean up application processes

```bash
dapr stop --app-id checkout
dapr stop --app-id order-processor
```
