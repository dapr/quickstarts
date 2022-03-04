# Service Invocation

In this quickstart, you'll create a checkout service and an order processor service to demonstrate how to use the service invocation API. The checkout service uses Dapr's http proxying capability to invoke a method on the order processing service.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/) link for more information about Dapr and service invocation.

This quickstart includes one checkout service:

- Dotnet client service `checkout` 

And one order processor service: 
 
- Dotnet order-processor service `order-processor`

### Run Dotnet checkout with Dapr

1. Open a new terminal window and navigate to the `checkout` directory:

```bash
cd checkout
```

2. Install dependencies: 

<!-- STEP
name: Install Dotnet dependencies
working_dir: ./checkout
-->

```bash
dotnet restore
dotnet build
```

3. Run the Dotnet checkout app with Dapr: 
    
```bash
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- dotnet run
```

<!-- END_STEP -->
### Run Dotnet order-processor with Dapr

1. Open a new terminal window and navigate to `order-processor` directory: 

```bash
cd order-processor
```

2. Install dependencies: 

<!-- STEP
name: Install Dotnet dependencies
working_dir: ./order-processor
-->

```bash
dotnet restore
dotnet build
```

3. Run the Dotnet order-processor app with Dapr: 

```bash
dapr run --app-port 6001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- dotnet run
```

<!-- END_STEP -->
