# Service Invocation

In this quickstart, you'll create a checkout service and an order processor service to demonstrate how to use the service invocation API. The checkout service uses Dapr's http proxying capability to invoke a method on the order processing service.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/) link for more information about Dapr and service invocation.

This quickstart includes one checkout service:

- Dotnet client service `checkout` 

And one order processor service: 
 
- Dotnet order-processor service `order-processor`

### Run Dotnet order-processor with Dapr

1. Open a new terminal window and navigate to `order-processor` directory and install dependencies: 

<!-- STEP
name: Install Dotnet dependencies
-->

```bash
cd ./order-processor
dotnet restore
dotnet build
```

<!-- END_STEP -->

2. Run the Dotnet order-processor app with Dapr: 

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP == Order received : Order { orderId = 10 }'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 10
-->

```bash
cd ./order-processor
dapr run --app-port 7001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- dotnet run
```

<!-- END_STEP -->

### Run Dotnet checkout with Dapr

1. Open a new terminal window and navigate to the `checkout` directory and install dependencies:

<!-- STEP
name: Install Dotnet dependencies
-->

```bash
cd ./checkout
dotnet restore
dotnet build
```

<!-- END_STEP -->

2. Run the Dotnet checkout app with Dapr: 

<!-- STEP
name: Run checkout service
expected_stdout_lines:
  - '== APP == Order passed: Order { OrderId = 1 }'
  - '== APP == Order passed: Order { OrderId = 2 }'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 10
-->
    
```bash
cd ./checkout
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- dotnet run
```

<!-- END_STEP -->

```bash
dapr stop --app-id order-processor
```

### Start all apps with multi app run template file:

1. Open a new terminal window and install dependencies for `order-processor` and `checkout` apps:

<!-- STEP
name: Install Dotnet dependencies for order-processor and checkout
-->

```bash
cd ./order-processor
dotnet restore
dotnet build
cd ../checkout
dotnet restore
dotnet build
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