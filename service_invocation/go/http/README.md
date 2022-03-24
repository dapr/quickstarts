# Service Invocation

In this quickstart, you'll create a checkout service and an order processor service to demonstrate how to use the service invocation API. The checkout service uses Dapr's http proxying capability to invoke a method on the order processing service.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/) link for more information about Dapr and service invocation.

This quickstart includes one checkout service:

- Go client service `checkout` 

And one order processor service: 
 
- Go order-processor service `order-processor`

### Run Go order-processor with Dapr

1. Open a new terminal window and navigate to `order-processor` directory: 

<!-- STEP
name: Build Go file
-->

```bash
cd ./order-processor
go build app.go
```

<!-- END_STEP -->

2. Run the Go order-processor app with Dapr: 

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP == Order received :  {"orderId":10}'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->

```bash
cd ./order-processor
dapr run --app-port 6001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- go run app.go
```

<!-- END_STEP -->

### Run Go checkout with Dapr

1. Open a new terminal window and navigate to `checkout` directory: 

<!-- STEP
name: Build Go file
-->

```bash
cd ./checkout
go build app.go
```
<!-- END_STEP -->

2. Run the Go checkout app with Dapr: 

<!-- STEP
name: Run checkout service
expected_stdout_lines:
  - '== APP == Order passed:  {"orderId":1}'
  - '== APP == Order passed:  {"orderId":2}'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->
    
```bash
cd ./checkout
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- go run app.go
```

<!-- END_STEP -->

```bash
dapr stop --app-id checkout
dapr stop --app-id order-processor
```
