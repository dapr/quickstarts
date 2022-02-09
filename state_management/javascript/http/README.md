# Dapr state management (HTTP Client)

In this quickstart, you'll create a microservice to demonstrate how Dapr enables a state management pattern. The service will generate messages to store data in to the state store. See [Why State Management](#why-state-management) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/state-management/) link for more information about Dapr and State Management.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

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
npm start:dapr
```

<!-- END_STEP -->