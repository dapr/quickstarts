# Dapr pub/sub

 In this quickstart, there is a publisher microservice `checkout` and a subscriber microservice `order-processor` to demonstrate how Dapr enables a publish-subscribe pattern. `checkout` generates messages and publishes to a specific orders topic, and `order-processor` subscribers listen for messages of topic orders.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/pubsub/) link for more information about Dapr and Pub-Sub.

> **Note:** This example leverages the Dapr client SDK.  If you are looking for the example using only HTTP [click here](../http).

This quickstart includes one publisher:

- Java client message generator `checkout`

And one subscriber:

- Java subscriber `order-processor`

## Pre-requisites

* [Dapr and Dapr Cli](https://docs.dapr.io/getting-started/install-dapr-cli/).
* Java JDK 17 (or greater):
  * [Microsoft JDK 17](https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-17)
  * [Oracle JDK 17](https://www.oracle.com/java/technologies/downloads/?er=221886#java17)
  * [OpenJDK 17](https://jdk.java.net/17/)
* [Apache Maven](https://maven.apache.org/install.html) version 3.x.

## Run all apps with multi-app run template file:

This section shows how to run both applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.  

1. Install dependencies: 

<!-- STEP
name: Install Node dependencies
-->
```bash
cd ./order-processor
mvn clean install
cd ..
cd ./checkout
mvn clean install
cd ..
```
<!-- END_STEP -->

2. Open a new terminal window and run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Started Dapr with app id "order-processor-sdk"'
  - 'Started Dapr with app id "checkout-sdk"'
  - 'Published data: 2'
  - 'Subscriber received: 2'
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
== APP - checkout-sdk == 563 [main] INFO com.service.CheckoutServiceApplication - Published data: 1
== APP - order-processor-sdk == 2023-09-04 13:57:18.434  INFO 82828 --- [nio-8080-exec-3] c.s.c.OrderProcessingServiceController   : Subscriber received: 1
== APP - checkout-sdk == 1576 [main] INFO com.service.CheckoutServiceApplication - Published data: 2
== APP - order-processor-sdk == 2023-09-04 13:57:19.419  INFO 82828 --- [nio-8080-exec-4] c.s.c.OrderProcessingServiceController   : Subscriber received: 2
== APP - checkout-sdk == 2587 [main] INFO com.service.CheckoutServiceApplication - Published data: 3
== APP - order-processor-sdk == 2023-09-04 13:57:20.431  INFO 82828 --- [nio-8080-exec-5] c.s.c.OrderProcessingServiceController   : Subscriber received: 3
== APP - checkout-sdk == 3602 [main] INFO com.service.CheckoutServiceApplication - Published data: 4
== APP - order-processor-sdk == 2023-09-04 13:57:21.447  INFO 82828 --- [nio-8080-exec-6] c.s.c.OrderProcessingServiceController   : Subscriber received: 4
== APP - checkout-sdk == 4612 [main] INFO com.service.CheckoutServiceApplication - Published data: 5
== APP - order-processor-sdk == 2023-09-04 13:57:22.455  INFO 82828 --- [nio-8080-exec-7] c.s.c.OrderProcessingServiceController   : Subscriber received: 5
== APP - checkout-sdk == 5624 [main] INFO com.service.CheckoutServiceApplication - Published data: 6
== APP - order-processor-sdk == 2023-09-04 13:57:23.468  INFO 82828 --- [nio-8080-exec-8] c.s.c.OrderProcessingServiceController   : Subscriber received: 6
== APP - checkout-sdk == 6631 [main] INFO com.service.CheckoutServiceApplication - Published data: 7
== APP - order-processor-sdk == 2023-09-04 13:57:24.474  INFO 82828 --- [nio-8080-exec-9] c.s.c.OrderProcessingServiceController   : Subscriber received: 7
== APP - checkout-sdk == 7643 [main] INFO com.service.CheckoutServiceApplication - Published data: 8
== APP - order-processor-sdk == 2023-09-04 13:57:25.487  INFO 82828 --- [io-8080-exec-10] c.s.c.OrderProcessingServiceController   : Subscriber received: 8
== APP - checkout-sdk == 8649 [main] INFO com.service.CheckoutServiceApplication - Published data: 9
== APP - order-processor-sdk == 2023-09-04 13:57:26.492  INFO 82828 --- [nio-8080-exec-2] c.s.c.OrderProcessingServiceController   : Subscriber received: 9
== APP - checkout-sdk == 9662 [main] INFO com.service.CheckoutServiceApplication - Published data: 10
== APP - order-processor-sdk == 2023-09-04 13:57:27.504  INFO 82828 --- [nio-8080-exec-1] c.s.c.OrderProcessingServiceController   : Subscriber received: 10
```

3. Stop and clean up application processes

```bash
dapr stop -f .
```
<!-- END_STEP -->

## Run a single app at a time with Dapr (Optional)

An alternative to running all or multiple applications at once is to run single apps one-at-a-time using multiple `dapr run .. -- dotnet run` commands.  This next section covers how to do this. 

### Run Java message subscriber app with Dapr

1. Navigate to directory and install dependencies:

```bash
cd ./order-processor
mvn clean install
```

2. Run the Java subscriber app with Dapr:

```bash
cd ./order-processor
 dapr run --app-port 8080 --app-id order-processor-sdk --resources-path ../../../components -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

### Run Java message publisher app with Dapr

1. Navigate to the directory and install dependencies:

```bash
cd ./checkout
mvn clean install
```

2. Run the Java publisher app with Dapr:

```bash
cd ./checkout
dapr run --app-id checkout-sdk --resources-path ../../../components -- java -jar target/CheckoutService-0.0.1-SNAPSHOT.jar
```

```bash
dapr stop --app-id checkout-sdk
dapr stop --app-id order-processor-sdk
```
