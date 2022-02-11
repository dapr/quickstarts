# Dapr state management

In this quickstart, you'll create a microservice to demonstrate how Dapr enables a state management pattern. The service will generate messages to store data in to the state store. See [Why State Management](#why-state-management) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/state-management/) link for more information about Dapr and State Management.

> **Note:** This example leverages the Dapr client SDK.  If you are looking for the example using only HTTP [click here](../http).

This quickstart includes one service:

- Dotnet client service `order-processor` 

### Run Dotnet service with Dapr

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

3. Run the Dotnet service app with Dapr: 
    
```bash
dapr run --app-id order-processor --components-path ../../../components/ -- dotnet run
```

<!-- END_STEP -->