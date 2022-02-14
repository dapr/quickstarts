# Dapr state management (HTTP Client)

In this quickstart, you'll create a microservice to demonstrate Dapr's state management API. The service generates messages to store data in a state store. See [Why state management](#why-state-management) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/state-management/) link for more information about Dapr and State Management.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

This quickstart includes one service:

- Go client service `order-processor` 

### Run Go service with Dapr

1. Open a new terminal window and navigate to `order-processor` directory: 

```bash
cd order-processor
```

2. Install dependencies: 

<!-- STEP
name: Build Go file
working_dir: ./order-processor
-->

```bash
go build app.go
```

3. Run the Go service app with Dapr: 
    
```bash
dapr run --app-id order-processor --components-path ../../../components/ -- go run app.go
```

<!-- END_STEP -->