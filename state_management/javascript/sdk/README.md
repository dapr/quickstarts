# Dapr state management

In this quickstart, you'll create a microservice to demonstrate Dapr's state management API. The service generates messages to store data in a state store. See [Why state management](#why-state-management) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/state-management/) link for more information about Dapr and State Management.

> **Note:** This example leverages the Dapr client SDK. If you are looking for the example using only HTTP [click here](../http).

This quickstart includes one service:

- Node client service `order-processor` 

This quickstart includes one service:

- Node client service `order-processor` 

### Run Node service with Dapr

1. Open a new terminal window and navigate to `order-processor` directory: 

```bash
cd order-processor
```

2. Install dependencies: 

<!-- STEP
name: Install Node dependencies
working_dir: ./order-processor
-->

```bash
npm install
```

3. Run the Node service app with Dapr: 
    
```bash
dapr run --app-id order-processor --components-path ../../../components/ -- npm start
```

<!-- END_STEP -->