# Service Invocation

In this quickstart, you'll create a checkout service and an order-processor service to demonstrate how to use the service invocation API. The checkout service uses Dapr's HTTP proxying capability to invoke a method on the order processing service.

Check out the documentation about [service invocation](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/) for more details.

This quickstart includes one checkout service: Go client service `checkout`

And one order processor service: Go order-processor service `order-processor`

## Run all apps with multi-app run template file:

This section shows how to run both applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.  

1. Open a new terminal window and run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Started Dapr with app id "order-processor"'
  - 'Started Dapr with app id "checkout"'
  - '== APP - order-processor == Order received: {"orderId":10}'
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
== APP - order-processor == Subscriber received: {"orderId":1}
== APP - checkout-http == Published data: {"orderId":2}
== APP - order-processor == Subscriber received: {"orderId":2}
== APP - checkout-http == Published data: {"orderId":3}
== APP - order-processor == Subscriber received: {"orderId":3}
== APP - checkout-http == Published data: {"orderId":4}
== APP - order-processor == Subscriber received: {"orderId":4}
== APP - checkout-http == Published data: {"orderId":5}
== APP - order-processor == Subscriber received: {"orderId":5}
== APP - checkout-http == Published data: {"orderId":6}
== APP - order-processor == Subscriber received: {"orderId":6}
== APP - checkout-http == Published data: {"orderId":7}
== APP - order-processor == Subscriber received: {"orderId":7}
== APP - checkout-http == Published data: {"orderId":8}
== APP - order-processor == Subscriber received: {"orderId":8}
== APP - checkout-http == Published data: {"orderId":9}
== APP - order-processor == Subscriber received: {"orderId":9}
== APP - checkout-http == Published data: {"orderId":10}
== APP - order-processor == Subscriber received: {"orderId":10}
```

3. Stop and clean up application processes

```bash
dapr stop -f .
```
<!-- END_STEP -->

## Run a single app at a time with Dapr (Optional)

An alternative to running all or multiple applications at once is to run single apps one-at-a-time using multiple `dapr run .. -- go run .` commands.  This next section covers how to do this. 

### Run Go order-processor with Dapr

1. Run the order-processor app with Dapr in the `order-processor` folder:

```bash
cd ./order-processor
dapr run \
  --app-port 6006 \
  --app-id order-processor \
  --app-protocol http \
  --dapr-http-port 3501 \
  -- go run .
```

### Run Go checkout with Dapr

1. Open a new terminal window and navigate to `checkout` directory, then run the Go checkout app with Dapr:

```bash
cd ./checkout
dapr run \
  --app-id checkout \
  --dapr-http-port 3500 \
  -- go run .
```

### Stop the apps and clean up

```bash
dapr stop --app-id checkout
dapr stop --app-id order-processor
```
