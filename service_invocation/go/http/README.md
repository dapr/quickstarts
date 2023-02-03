# Service Invocation

In this quickstart, you'll create a checkout service and an order-processor service to demonstrate how to use the service invocation API. The checkout service uses Dapr's HTTP proxying capability to invoke a method on the order processing service.

Check out the documentation about [service invocation](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/) for more details.

This quickstart includes one checkout service: Go client service `checkout`

And one order processor service: Go order-processor service `order-processor`

### Run Go order-processor with Dapr

1. Run the order-processor app with Dapr in the `order-processor` folder:

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP == Order received: {"orderId":10}'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->

```bash
cd ./order-processor
dapr run \
  --app-port 6001 \
  --app-id order-processor \
  --app-protocol http \
  --dapr-http-port 3501 \
  -- go run .
```

<!-- END_STEP -->

### Run Go checkout with Dapr

1. Open a new terminal window and navigate to `checkout` directory, then run the Go checkout app with Dapr:

<!-- STEP
name: Run checkout service
expected_stdout_lines:
  - '== APP == Order passed: {"orderId":1}'
  - '== APP == Order passed: {"orderId":2}'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->

```bash
cd ./checkout
dapr run \
  --app-id checkout \
  --dapr-http-port 3500 \
  -- go run .
```

<!-- END_STEP -->

To stop:

```bash
dapr stop --app-id checkout
dapr stop --app-id order-processor
```

### Start all apps with multi app run template file:

1. Run the multi app run template:

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