# Dapr Samples

[![Build Status](https://github.com/dapr/samples/workflows/samples/badge.svg?event=push&branch=master)](https://github.com/dapr/samples/actions?workflow=samples)
[![Join the chat at https://gitter.im/Dapr/samples](https://badges.gitter.im/Dapr/samples.svg)](https://gitter.im/Dapr/samples?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This repository contains a series of samples that highlight Dapr capabilities. The first sample demonstrates how we run Dapr in standalone mode, while the second highlights how we run the same application in Kubernetes. Each subsequent sample includes instructions for running both in standalone and in Kubernetes.

## Getting Started

It is recommended to go through the samples via the [Getting Started](https://github.com/dapr/docs/tree/master/getting-started) instructions.

## Supported Dapr Runtime version

Dapr is currently under community development with preview releases.  The master branch includes breaking changes, therefore ensure that you're running the samples with the right version of Dapr runtime.

| Dapr Sample Version  | Dapr Runtime Version |
|:--------------------:|:--------------------:|
| [v0.7.0](https://github.com/dapr/samples/tree/v0.7.0) | [v0.7.0](https://github.com/dapr/dapr/tree/v0.7.0) |
| [v0.6.0](https://github.com/dapr/samples/tree/v0.6.0) | [v0.6.0](https://github.com/dapr/dapr/tree/v0.6.0) |
| [v0.5.0](https://github.com/dapr/samples/tree/v0.5.0) | [v0.5.0](https://github.com/dapr/dapr/tree/v0.5.0) |
| [v0.4.0](https://github.com/dapr/samples/tree/v0.4.0) | [v0.4.0](https://github.com/dapr/dapr/tree/v0.4.0) |
| [v0.3.0](https://github.com/dapr/samples/tree/v0.3.0) | [v0.3.0](https://github.com/dapr/dapr/tree/v0.3.0) |
| [v0.2.0](https://github.com/dapr/samples/tree/v0.2.0) | [v0.2.0](https://github.com/dapr/dapr/tree/v0.2.0) |
| [v0.1.0](https://github.com/dapr/samples/tree/v0.1.0) | [v0.1.0](https://github.com/dapr/dapr/tree/v0.1.0) |

## Samples

| Sample                   | Description                                                                                                                                                                                    |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [1. Hello-world](./1.hello-world)            | Demonstrates how to run Dapr locally. Highlights service invocation and state management.                                                                                                      |
| [2. Hello-kubernetes](./2.hello-kubernetes)       | Demonstrates how to run Dapr in Kubernetes. Highlights service invocation and state management.                                                                                                |
| [3. Distributed-calculator](./3.distributed-calculator) | Demonstrates a distributed calculator application that uses Dapr services to power a React web app. Highlights polyglot (multi-language) programming, service invocation and state management. |
| [4. Pub-sub](./4.pub-sub)                | Demonstrates how we use Dapr to enable pub-sub applications. Uses Redis as a pub-sub component.                                                                                          |
| [5. Bindings](./5.bindings)            | Demonstrates how we use Dapr to create input and output bindings to other components. Uses bindings to Kafka.                                                                            |
| [6. Functions-and-keda](./6.functions-and-keda) | Demonstrates use of Dapr pub/sub from Azure Functions, as well as composition with KEDA. |
| [7. Middleware](./7.middleware) | Demonstrates use of Dapr middleware to enable OAuth 2.0 authorization. |
| [8. Observability](./8.observability) | Demonstrates Dapr tracing capabilities. Uses Zipkin as a tracing component. |

## SDKs

Find SDK-specific samples in the links below:

- **[.NET SDK](https://github.com/dapr/dotnet-sdk)**
  - **[Getting Started with .NET Actors](https://github.com/dapr/dotnet-sdk/blob/master/docs/get-started-dapr-actor.md)** - Tutorial for developing actor applications using the Dapr .NET SDK including  **[actor samples](https://github.com/dapr/dotnet-sdk/tree/master/samples/Actor)**
  - **[Getting Started with ASP.NET Core](https://github.com/dapr/dotnet-sdk/tree/master/samples/AspNetCore)** - Samples for developing ASP.NET applications using the Dapr .NET SDK
- **[Java SDK](https://github.com/dapr/java-sdk)**
  - **[Example for Java Actors](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/actors/http)** - Example for developing an actor application using the Java SDK.
- **[Go SDK](https://github.com/dapr/go-sdk)**
- **[Javascript SDK](https://github.com/dapr/js-sdk)**
- **[Python SDK](https://github.com/dapr/python-sdk)**
  
To get started with the samples, clone this repository and follow instructions in each sample:
```bash
git clone https://github.com/dapr/samples.git
```
