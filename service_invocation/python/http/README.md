# Service Invocation

In this quickstart, you'll create a checkout service and an order processor service to demonstrate how to use the service invocation API. The checkout service uses Dapr's http proxying capability to invoke a method on the order processing service.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/) link for more information about Dapr and service invocation.

This quickstart includes one checkout service:

- Python client service `checkout` 

And one order processor service: 
 
- Python order-processor service `order-processor`

### Run Python order-processor with Dapr

1. Open a new terminal window and navigate to `order-processor` directory and install dependencies: 

<!-- STEP
name: Install Python dependencies
-->

```bash
pip3 install -r ./order-processor/requirements.txt 
```

<!-- END_STEP -->

2. Run the Python order-processor app with Dapr: 

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP == Order received : {"orderId": 10}'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 5
timeout_seconds: 30
-->

```bash
dapr run --app-port 7001 --app-id order-processor --app-protocol http --dapr-http-port 3501 python3 ./order-processor/app.py
```

<!-- END_STEP -->

### Run Python checkout with Dapr

1. Open a new terminal window and navigate to `checkout` directory and install dependencies: 

<!-- STEP
name: Install Python dependencies
-->

```bash
pip3 install -r ./checkout/requirements.txt 
```

<!-- END_STEP -->

2. Run the Python checkout app with Dapr: 

<!-- STEP
name: Run checkout service
expected_stdout_lines:
  - '== APP == Order passed: {"orderId": 1}'
  - '== APP == Order passed: {"orderId": 2}'
  - "Exited App successfully"
expected_stderr_lines:
background: true
output_match_mode: substring
sleep: 5
timeout_seconds: 10
-->
    
```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3502 python3 ./checkout/app.py
```

<!-- END_STEP -->

```bash
dapr stop --app-id checkout
dapr stop --app-id order-processor
```
