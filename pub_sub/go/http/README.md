# Dapr pub/sub

In this quickstart, you'll create a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a publish-subcribe pattern. The publisher generates messages for a specific topic, while the subscriber listen for messages in specific topics.

Check out the documentation about [Dapr pubsub](https://docs.dapr.io/developing-applications/building-blocks/pubsub/) for more details.

> **Note:** This example leverages HTTP `requests` only. You can find an example of using the Dapr Client SDK (recommended) in the [`sdk` folder](../sdk/).

This quickstart includes one publisher: Go client message generator `checkout`.

And one subscriber: Go subscriber `order-processor`.

### Run Go message subscriber with Dapr

1. Run the Go subscriber app with Dapr in the `order-processor` folder:

<!-- STEP
name: Run Go subscriber
expected_stdout_lines:
  - '== APP == Subscriber received: {"orderId":10}'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->

```bash
cd ./order-processor
dapr run --app-port 6001 --app-id order-processor --app-protocol http --dapr-http-port 3501 --resources-path ../../../components -- go run .
```

<!-- END_STEP -->

### Run Go message publisher with Dapr

1. Run the Go publisher app with Dapr in the `checkout` folder:

<!-- STEP
name: Run Go publisher
expected_stdout_lines:
  - '== APP == Published data: {"orderId":1}'
  - '== APP == Published data: {"orderId":2}'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->

```bash
cd ./checkout
dapr run --app-id checkout-http --app-protocol http --dapr-http-port 3500 --resources-path ../../../components -- go run .
```

<!-- END_STEP -->

To stop:

```bash
dapr stop --app-id checkout-http
dapr stop --app-id order-processor
```
