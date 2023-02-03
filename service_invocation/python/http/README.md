# Service Invocation

In this quickstart, you'll create a checkout service and an order processor service to demonstrate how to use the service invocation API. The checkout service uses Dapr's http proxying capability to invoke a method on the order processing service.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/) link for more information about Dapr and service invocation.

This quickstart includes one checkout service:

- Python client service `checkout` 

And one order processor service: 
 
- Python order-processor service `order-processor`

### Run Python order-processor with Dapr

1. Install dependencies for `order-processor` app: 

<!-- STEP
name: Install Python dependencies
-->

```bash
pip3 install -r order-processor/requirements.txt 
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
sleep: 15
-->

```bash
dapr run --app-port 8001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- python3 order-processor/app.py
```

<!-- END_STEP -->

### Run Python checkout with Dapr

1. Open a new terminal window and install dependencies for `checkout` app: 

<!-- STEP
name: Install Python dependencies
-->

```bash
pip3 install -r checkout/requirements.txt 
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
output_match_mode: substring
background: true
sleep: 15
-->
    
```bash
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- python3 checkout/app.py
```

<!-- END_STEP -->

```bash
dapr stop --app-id checkout
dapr stop --app-id order-processor
```

### Start all apps with multi app run template file:

The dependencies are already installed from previous steps. Simply run the multi app run template. It uses `dapr.yaml` file to determine which applications to run.

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
dapr run -f .
```

<!-- END_STEP -->

Finally, stop all:

```bash
dapr stop -f .
```