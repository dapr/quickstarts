# Dapr Node.js SDK

The official [Dapr](https://dapr.io) Node.js SDK that allows interfacing with the Dapr sidecar for easy application building.

## Introduction

The Dapr JS SDK will allow you to interface with the Dapr process that abstracts several commonly used functionalities such as Service-to-Service invocation, State Management, PubSub, and more.

![](./documentation/assets/dapr-architecture.png)

Looking at the illustration above, we can see there will always always be another process (the Dapr Sidecar) running that your application will interface with. This process can either be started manually (e.g. through Dapr CLI) or injected as a container (e.g. through Kubernetes Sidecar injection in your pod).

For your application to interface with this, 2 components should be taken into account:
* **DaprServer:** Dapr Sidecar -> our Application - When we Subscribe to a Topic, Create an Actor, ... we receive an event from the Dapr process that abstracted its implementation. Our application should thus listen to this (which this SDK helps you with).
* **DaprClient:** Your Application -> Dapr Sidecar - When we want to Publish an Event, Execute a Binding, ... we will talk with the Dapr process that calls its implementation for us so that we don't have to write it ourself!

## Simple Example

> [Full version](./examples/http/pubsub)

As a simple example, consider the use case: "Creating a PubSub where we can publish a message on a Topic and also receive messages back from this topic". Normally for this use case we would have to look at the Broker that we want to utilize and implement their specificities. While as with Dapr we can use a simple SDK and configure the "component" that we want to interface with.

> 🤩 This also means that if we want to switch from one broker to another (e.g. [Azure Service Bus](https://docs.dapr.io/reference/components-reference/supported-pubsub/setup-azure-servicebus/) to [RabbitMQ](https://docs.dapr.io/reference/components-reference/supported-pubsub/setup-rabbitmq/)) we just have to change the component implementation!

**component.yaml**

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: my-pubsub-component
  namespace: default
spec:
  type: pubsub.rabbitmq
  version: v1
  metadata:
  - name: host
    value: "amqp://localhost:5672"
```

**example.ts**

```javascript
import { DaprClient, DaprServer } from "dapr-client";

const daprHost = "127.0.0.1"; // Dapr Sidecar Host
const daprPort = "50000"; // Dapr Sidecar Port
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50001"; // App Port of this Example Server

// Create a Server (will subscribe) and Client (will publish)
const server = new DaprServer(serverHost, serverPort, daprHost, daprPort);
const client = new DaprClient(daprHost, daprPort);

// Initialize the server to subscribe (listen)
await server.pubsub.subscribe("my-pubsub-component", "my-topic", async (data: any) => console.log(`Received: ${JSON.stringify(data)}`));
await server.startServer();

// Send a message
await client.pubsub.publish("my-pubsub-component", "my-topic", { hello: "world" });
```

To start this we of course have to start the Dapr process with it. With the command below we can utilize the CLI to quickly test this:

```bash
dapr run --app-id example-http-pubsub --app-protocol http --app-port 50001 --dapr-http-port 50000 --components-path ./components npm run start
```

Which will result in the message:

```bash
Received: {"hello":"world"}
```

## Information & Links

* [Reference](./documentation/reference.md) containing code snippets of how to use the different methods.
* [Examples](./documentation/examples.md) containing examples you can use to build your application.
* [Development](./documentation/development.md) containing pointers for getting started on how to contribute to the SDK.
