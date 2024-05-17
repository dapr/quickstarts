# Dapr Quickstarts and Tutorials

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/dapr/quickstarts/.github%2Fworkflows%2Fbuild.yml?branch=master&label=Build&logo=github&style=flat)](https://github.com/dapr/quickstarts/actions/workflows/build.yml) [![GitHub License](https://img.shields.io/github/license/dapr/quickstarts?style=flat&label=License&logo=github)](https://github.com/dapr/quickstarts/blob/master/LICENSE) [![GitHub issue custom search in repo](https://img.shields.io/github/issues-search/dapr/quickstarts?query=type%3Aissue%20is%3Aopen%20label%3A%22good%20first%20issue%22&label=Good%20first%20issues&style=flat&logo=github)](https://github.com/dapr/quickstarts/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) [![Discord](https://img.shields.io/discord/778680217417809931?label=Discord&style=flat&logo=discord)](http://bit.ly/dapr-discord) [![YouTube Channel Views](https://img.shields.io/youtube/channel/views/UCtpSQ9BLB_3EXdWAUQYwnRA?style=flat&label=YouTube%20views&logo=youtube)](https://youtube.com/@daprdev) [![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/daprdev?logo=x&style=flat)](https://twitter.com/daprdev)

If you are new to Dapr and haven't done so already, it is recommended you go through the Dapr [Getting Started](https://docs.dapr.io/getting-started/install-dapr-cli/) instructions.

### Quickstarts

Pick a building block API (for example, PubSub, state management, etc) and rapidly try it out in your favorite language SDK (recommended), or via HTTP. Visit the [Dapr Docs Quickstarts Guide](https://docs.dapr.io/getting-started/quickstarts/) for a comprehensive walkthrough of each example.

| Dapr Quickstart | Description |
|:--------:|:--------:|
| [Publish and Subscribe](./pub_sub) | Asynchronous communication between two services using messaging |
| [Service Invocation](./service_invocation) | Synchronous communication between two services using HTTP |
| [State Management](./state_management/) | Store a service's data as key/value pairs in supported state stores |
| [Bindings](./bindings/) | Work with external systems using input bindings to respond to events and output bindings to call operations |
| [Secrets Management](./secrets_management/) | Securely fetch secrets |
| [Actors](./actors) | Create stateful, long running objects with identity |
| [Configuration](./configuration) | Get configuration items as key/value pairs or subscribe to changes whenever a configuration item changes |
| [Cryptography](./cryptography) | Perform cryptographic operations without exposing keys to your application |
| [Resiliency](./resiliency) | Define and apply fault-tolerant policies (retries/back-offs, timeouts and circuit breakers) to your Dapr API requests |
| [Workflow](./workflows) | Dapr Workflow enables you to create long running, fault-tolerant, stateful applications |

### Tutorials

Go deeper into a topic or scenario, oftentimes using building block APIs together to solve problems (for example, build a distributed calculator, build and deploy an app to Kubernetes).

| Tutorials | Description |
|------|------|
| [Hello-world](./tutorials/hello-world) | Demonstrates how to run Dapr locally. Highlights service invocation and state management. |
| [Hello-kubernetes](./tutorials/hello-kubernetes) | Demonstrates how to run Dapr in Kubernetes. Highlights service invocation and state management. |
| [Distributed-calculator](./tutorials/distributed-calculator) | Demonstrates a distributed calculator application that uses Dapr services to power a React web app. Highlights polyglot (multi-language) programming, service invocation and state management. |
| [Pub-sub](./tutorials/pub-sub) | Demonstrates how to use Dapr to enable pub-sub applications. Uses Redis as a pub-sub component. |
| [Bindings](./tutorials/bindings) | Demonstrates how to use Dapr to create input and output bindings to other components. Uses bindings to Kafka.|
| [Observability](./tutorials/observability) | Demonstrates Dapr tracing capabilities. Uses Zipkin as a tracing component. |
| [Secret Store](./tutorials/secretstore) | Demonstrates the use of Dapr Secrets API to access secret stores. |

## Code of Conduct

Please refer to our [Dapr Community Code of Conduct](https://github.com/dapr/community/blob/master/CODE-OF-CONDUCT.md)
