# Dapr Quickstarts and Tutorials

[![Build Status](https://github.com/dapr/quickstarts/workflows/samples/badge.svg?event=push&branch=master)](https://github.com/dapr/quickstarts/actions?workflow=samples)
[![Discord](https://img.shields.io/discord/778680217417809931)](https://discord.com/channels/778680217417809931/778680217417809934)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache-yellow.svg)](https://www.apache.org/licenses/LICENSE-2.0)

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
| [Jobs](./jobs) | Dapr Jobs enable you to manage and schedule tasks |

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
| [Workflow](./tutorials/workflow) | Demonstrates how to author and manage Dapr workflows. Includes workflow patterns, resiliency, and common challenges & tips. |

## Development

### Updating sdk versions
- Python: `make update_python_sdk_version [DAPR_VERSION=1.16.0] [FASTAPI_VERSION=1.16.0] [WORKFLOW_VERSION=1.16.0]`
- Go: `make update_gosdk_version VERSION=v1.16.0`
- C#: `make update_dotnet_sdk_version VERSION=1.15.0`
- Java: `make update_java_sdk_version VERSION=1.12.0`
- Javascript: `make update_javascript_sdk_version VERSION=3.4.0`

### Validating all the quickstarts
To run the samples, you need to have Dapr installed. Follow the [Getting Started](https://docs.dapr.io/getting-started/install-dapr-cli/) guide to install Dapr.

- Python: `make test_python_quickstarts`
- Go: `make test_go_quickstarts`
- Java: `make test_java_quickstarts`
- JS: `make test_javascript_quickstarts`
- C#: `make test_csharp_quickstarts`
- All quickstarts: `make test_all_quickstarts`

### Validating a single quickstart
Navigate to the quickstart directory and run `make validate`.

```sh
cd conversation/python/sdk
make validate
```

## Code of Conduct

Please refer to our [Dapr Community Code of Conduct](https://github.com/dapr/community/blob/master/CODE-OF-CONDUCT.md)
