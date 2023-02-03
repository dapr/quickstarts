# Service Invocation

In this quickstart, you'll create a checkout service and an order processor service to demonstrate how to use the service invocation API. The checkout service uses Dapr's http proxying capability to invoke a method on the order processing service.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/) link for more information about Dapr and service invocation.

This quickstart includes one checkout service:

- Node client service `checkout` 

And one order-processor service: 
 
- Node order-processor service `order-processor`

### Run Node order-processor with Dapr

1. Open a new terminal window and navigate to `order-processor` directory and install dependencies: 

<!-- STEP
name: Install Node dependencies
-->

```bash
cd ./order-processor
npm install
```

<!-- END_STEP -->

3. Run the Node order-processor app with Dapr: 

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP == Order received: { orderId: 10 }'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->

```bash
cd ./order-processor
dapr run --app-port 5001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- npm start
```

<!-- END_STEP -->

### Run Node checkout with Dapr

1. Open a new terminal window and navigate to `checkout` directory and install dependencies: 

<!-- STEP
name: Install Node dependencies
-->

```bash
cd ./checkout
npm install
```

<!-- END_STEP -->

2. Run the Node checkout app with Dapr: 

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
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- npm start
```

<!-- END_STEP -->

```bash
dapr stop --app-id checkout
dapr stop --app-id order-processor
```

### Start all apps with multi app run template file:

1. Open a new terminal window and install dependencies for `order-processor` and `checkout` apps:

<!-- STEP
name: Install Node dependencies for order-processor and checkout
-->

```bash
cd ./order-processor
npm install
cd ../checkout
npm install
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