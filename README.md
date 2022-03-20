# Dapr Quickstarts and Tutorials

[![Build Status](https://github.com/dapr/quickstarts/workflows/samples/badge.svg?event=push&branch=master)](https://github.com/dapr/quickstarts/actions?workflow=samples)
[![Join the chat at https://gitter.im/Dapr/samples](https://badges.gitter.im/Dapr/samples.svg)](https://gitter.im/Dapr/samples?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache-yellow.svg)](https://www.apache.org/licenses/LICENSE-2.0)

If you are new to Dapr and haven't done so already, it is recommended you go through the Dapr [Getting Started](https://docs.dapr.io/getting-started/install-dapr-cli/) instructions.

### Quickstarts
Pick a building block API (for example, pub-sub, state management) and rapidly try it out in your favorite language SDK (recommended), or via HTTP. Visit the [Dapr Docs Quickstarts Guide](https://docs.dapr.io/getting-started/quickstarts/) for a comprehensive walkthrough of each example. 

| Dapr Quickstart | Description |
|:--------------------:|:--------------------:|
| [Publish and Subscribe](./pub_sub) | Demonstrates how to send messages to a topic with one service and subscribe to that topic with another service. |
| [Service Invocation](./service_invocation) |  Demonstrates to discover and securely invoke methods across services.  |
| [State Management](./state_management/) | Demonstrates how to store data as key/value pairs in supported state stores. |
| Bindings | Coming soon... | 
| Actors | Coming soon... |
| Observability | Coming soon... |
| Secrets Management | Coming soon... |
| Configuration | Coming soon... |

### Tutorials
Go deeper into a topic or scenario, oftentimes using building block APIs together to solve problems (for example, build a distributed calculator, build and deploy an app to Kubernetes).

| Tutorials  | Description                                                                                                                                                        |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Hello-world](./tutorials/hello-world)            | Demonstrates how to run Dapr locally. Highlights service invocation and state management.                                                                                                      |
| [Hello-kubernetes](./tutorials/hello-kubernetes)       | Demonstrates how to run Dapr in Kubernetes. Highlights service invocation and state management.                                                                                                |
| [Distributed-calculator](./tutorials/distributed-calculator) | Demonstrates a distributed calculator application that uses Dapr services to power a React web app. Highlights polyglot (multi-language) programming, service invocation and state management. |
| [Pub-sub](./tutorials/pub-sub)                | Demonstrates how to use Dapr to enable pub-sub applications. Uses Redis as a pub-sub component.                                                                                          |
| [Bindings](./tutorials/bindings)            | Demonstrates how to use Dapr to create input and output bindings to other components. Uses bindings to Kafka.                                                                            |
| [Observability](./tutorials/observability) | Demonstrates Dapr tracing capabilities. Uses Zipkin as a tracing component. |
| [Secret Store](./tutorials/secretstore) | Demonstrates the use of Dapr Secrets API to access secret stores. |

## Code of Conduct

Please refer to our [Dapr Community Code of Conduct](https://github.com/dapr/community/blob/master/CODE-OF-CONDUCT.md)
