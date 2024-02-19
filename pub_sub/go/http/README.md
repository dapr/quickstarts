# Dapr pub/sub

In this quickstart, you'll create a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a publish-subcribe pattern. The publisher generates messages for a specific topic, while the subscriber listen for messages in specific topics.

Check out the documentation about [Dapr pubsub](https://docs.dapr.io/developing-applications/building-blocks/pubsub/) for more details.

> **Note:** This example leverages HTTP `requests` only. You can find an example of using the Dapr Client SDK (recommended) in the [`sdk` folder](../sdk/).

This quickstart includes one publisher: Go client message generator `checkout`.

And one subscriber: Go subscriber `order-processor`.

## Run all apps with multi-app run template file:

This section shows how to run both applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.  

1. Open a new terminal window and run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Started Dapr with app id "order-processor-http"'
  - 'Started Dapr with app id "checkout-http"'
  - '== APP - checkout-http == Published data: {"orderId":10}'
  - '== APP - order-processor-http == Subscriber received: {"orderId":10}'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 30
timeout_seconds: 60
-->

```bash
dapr run -f .
```

The terminal console output should look similar to this:

```text
== APP - checkout-http == Published data: {"orderId":1}
== APP - order-processor-http == Subscriber received: {"orderId":1}
== APP - checkout-http == Published data: {"orderId":2}
== APP - order-processor-http == Subscriber received: {"orderId":2}
== APP - checkout-http == Published data: {"orderId":3}
== APP - order-processor-http == Subscriber received: {"orderId":3}
== APP - checkout-http == Published data: {"orderId":4}
== APP - order-processor-http == Subscriber received: {"orderId":4}
== APP - checkout-http == Published data: {"orderId":5}
== APP - order-processor-http == Subscriber received: {"orderId":5}
== APP - checkout-http == Published data: {"orderId":6}
== APP - order-processor-http == Subscriber received: {"orderId":6}
== APP - checkout-http == Published data: {"orderId":7}
== APP - order-processor-http == Subscriber received: {"orderId":7}
== APP - checkout-http == Published data: {"orderId":8}
== APP - order-processor-http == Subscriber received: {"orderId":8}
== APP - checkout-http == Published data: {"orderId":9}
== APP - order-processor-http == Subscriber received: {"orderId":9}
== APP - checkout-http == Published data: {"orderId":10}
== APP - order-processor-http == Subscriber received: {"orderId":10}
```

2. Stop and clean up application processes

```bash
dapr stop -f .
```
<!-- END_STEP -->

## Run a single app at a time with Dapr (Optional)

An alternative to running all or multiple applications at once is to run single apps one-at-a-time using multiple `dapr run .. -- dotnet run` commands.  This next section covers how to do this. 

### Run Go message subscriber with Dapr

1. Run the Go subscriber app with Dapr in the `order-processor` folder:

```bash
cd ./order-processor
dapr run --app-port 6007 --app-id order-processor-http --app-protocol http --dapr-http-port 3501 --resources-path ../../../components -- go run .
```

### Run Go message publisher with Dapr

1. Run the Go publisher app with Dapr in the `checkout` folder:

```bash
cd ./checkout
dapr run --app-id checkout-http --app-protocol http --dapr-http-port 3500 --resources-path ../../../components -- go run .
```

To stop:

```bash
dapr stop --app-id checkout-http
dapr stop --app-id order-processor
```
