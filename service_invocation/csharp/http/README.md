# Service Invocation

In this quickstart, you'll create a checkout service and an order processor service to demonstrate how to use the service invocation API. The checkout service uses Dapr's http proxying capability to invoke a method on the order processing service.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/) link for more information about Dapr and service invocation.

This quickstart includes one checkout service:

- .NET client service `checkout` 

And one order processor service: 
 
- .NET order-processor service `order-processor`

## Run all apps with multi-app run template file:

This section shows how to run both applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.  

1. Open a new terminal window and run `order-processor` and `checkout` using the multi app run template defined in [dapr.yaml](./dapr.yaml):

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Validating config and starting app "order-processor"'
  - 'Started Dapr with app id "order-processor"'
  - 'Writing log files to directory'
  - 'Validating config and starting app "checkout"'
  - 'Started Dapr with app id "checkout"'
  - 'Writing log files to directory'
  - 'Order received : Order { orderId = 2 }'
  - 'Order passed: Order { OrderId = 2 }'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 60
timeout_seconds: 30
-->

```bash
dapr run -f .
```

The terminal console output should look similar to this:

```text
Order received : Order { orderId = 1 }
Order passed: Order { OrderId = 1 }
Order received : Order { orderId = 2 }
Order passed: Order { OrderId = 2 }
Order received : Order { orderId = 3 }
Order passed: Order { OrderId = 3 }
Order received : Order { orderId = 4 }
Order passed: Order { OrderId = 4 }
Order received : Order { orderId = 5 }
Order passed: Order { OrderId = 5 }
Order received : Order { orderId = 6 }
Order passed: Order { OrderId = 6 }
Order received : Order { orderId = 7 }
Order passed: Order { OrderId = 7 }
Order received : Order { orderId = 8 }
Order passed: Order { OrderId = 8 }
Order received : Order { orderId = 9 }
Order passed: Order { OrderId = 9 }
Order received : Order { orderId = 10 }
Order passed: Order { OrderId = 10 }
```

2. Stop and clean up application processes

```bash
dapr stop -f .
```
<!-- END_STEP -->

## Run a single app at a time with Dapr (Optional)

An alternative to running all or multiple applications at once is to run single apps one-at-a-time using multiple `dapr run .. -- dotnet run` commands.  This next section covers how to do this. 

### Run .NET `order-processor` with Dapr

1. Open a new terminal window and run the Dotnet order-processor app with Dapr: 

```bash
cd ./order-processor
dapr run --app-port 7001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- dotnet run
```

### Run .NET `checkout` with Dapr

1. Open a new terminal and run the Dotnet checkout app with Dapr: 

```bash
cd ./checkout
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- dotnet run
```

### Stop and clean up application processes
```bash
dapr stop --app-id order-processor
dapr stop --app-id checkout
```
