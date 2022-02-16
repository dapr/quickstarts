# Dapr Service Invocation

In this quickstart, you'll create a checkout service and a order processor service to demonstrate how Dapr enables a service invocation pattern. See [Why Service-Invocation](#why-service-invocation) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/) link for more information about Dapr and Service Invocation.

This quickstart includes one checkout service:

- Go client service `checkout` 

And one order-processor service: 
 
- Go order-processor service `order-processor`

### Run Go checkout with Dapr

1. Open a new terminal window and navigate to `checkout` directory: 

```bash
cd checkout
```

2. Install dependencies: 

<!-- STEP
name: Install Go dependencies
working_dir: ./checkout
-->

```bash
go build app.go
```

3. Run the Go checkout app with Dapr: 
    
```bash
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- go run app.go
```

<!-- END_STEP -->
### Run Go order-processor with Dapr

1. Open a new terminal window and navigate to `order-processor` directory: 

```bash
cd order-processor
```

2. Install dependencies: 

<!-- STEP
name: Install Go dependencies
working_dir: ./order-processor
-->

```bash
go build app.go
```

3. Run the Go order-processor app with Dapr: 

```bash
dapr run --app-port 6001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- go run app.go
```

<!-- END_STEP -->
