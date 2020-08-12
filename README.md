# Dapr Quickstarts

[![Build Status](https://github.com/dapr/quickstarts/workflows/samples/badge.svg?event=push&branch=master)](https://github.com/dapr/quickstarts/actions?workflow=samples)
[![Join the chat at https://gitter.im/Dapr/samples](https://badges.gitter.im/Dapr/samples.svg)](https://gitter.im/Dapr/samples?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This repository contains a collection of code samples that are aimed to get you started quickly with Dapr, each highlighting a different Dapr capability. The first quickstart to begin with is *hello-world*, it demonstrates how to run Dapr in standalone mode locally on your machine. If you are familiar with Kubernetes and want to see how to run the same application in Kubernetes, look for the *hello-kubernetes* quickstart. Each of the other quickstarts which explore different Dapr capabilities include instructions for running both in standalone and in Kubernetes.

## Getting Started

It is recommended to go through the samples via the [Getting Started](https://github.com/dapr/docs/tree/master/getting-started) instructions.

## Supported Dapr Runtime version

Dapr is currently under community development with preview releases.  The master branch includes breaking changes, therefore ensure that you're running the samples with the right version of Dapr runtime.

| Dapr Quickstart Version  | Dapr Runtime Version |
|:--------------------:|:--------------------:|
| [v0.9.0](https://github.com/dapr/quickstarts/tree/v0.9.0) | [v0.9.0](https://github.com/dapr/dapr/tree/v0.9.0) |
| [v0.8.0](https://github.com/dapr/quickstarts/tree/v0.8.0) | [v0.8.0](https://github.com/dapr/dapr/tree/v0.8.0) |
| [v0.7.0](https://github.com/dapr/quickstarts/tree/v0.7.0) | [v0.7.0](https://github.com/dapr/dapr/tree/v0.7.0) |
| [v0.6.0](https://github.com/dapr/quickstarts/tree/v0.6.0) | [v0.6.0](https://github.com/dapr/dapr/tree/v0.6.0) |
| [v0.5.0](https://github.com/dapr/quickstarts/tree/v0.5.0) | [v0.5.0](https://github.com/dapr/dapr/tree/v0.5.0) |
| [v0.4.0](https://github.com/dapr/quickstarts/tree/v0.4.0) | [v0.4.0](https://github.com/dapr/dapr/tree/v0.4.0) |
| [v0.3.0](https://github.com/dapr/quickstarts/tree/v0.3.0) | [v0.3.0](https://github.com/dapr/dapr/tree/v0.3.0) |
| [v0.2.0](https://github.com/dapr/quickstarts/tree/v0.2.0) | [v0.2.0](https://github.com/dapr/dapr/tree/v0.2.0) |
| [v0.1.0](https://github.com/dapr/quickstarts/tree/v0.1.0) | [v0.1.0](https://github.com/dapr/dapr/tree/v0.1.0) |

## Quickstarts

| Quickstart                   | Description                                                                                                                                                                                    |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [1. Hello-world](./hello-world)            | Demonstrates how to run Dapr locally. Highlights service invocation and state management.                                                                                                      |
| [2. Hello-kubernetes](./hello-kubernetes)       | Demonstrates how to run Dapr in Kubernetes. Highlights service invocation and state management.                                                                                                |
| [3. Distributed-calculator](./distributed-calculator) | Demonstrates a distributed calculator application that uses Dapr services to power a React web app. Highlights polyglot (multi-language) programming, service invocation and state management. |
| [4. Pub-sub](./pub-sub)                | Demonstrates how we use Dapr to enable pub-sub applications. Uses Redis as a pub-sub component.                                                                                          |
| [5. Bindings](./bindings)            | Demonstrates how we use Dapr to create input and output bindings to other components. Uses bindings to Kafka.                                                                            |
| [6. Middleware](./middleware) | Demonstrates use of Dapr middleware to enable OAuth 2.0 authorization. |
| [7. Observability](./observability) | Demonstrates Dapr tracing capabilities. Uses Zipkin as a tracing component. |
| [8. Secret Store](./secretstore) | Demonstrates the use of Dapr Secrets API. |

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
  
To get started with the quickstarts, clone this repository and follow instructions in each sample:
```bash
git clone [-b <dapr_version_tag>] https://github.com/dapr/quickstarts.git
```
> **Note**: See https://github.com/dapr/quickstarts#supported-dapr-runtime-version for supported tags. Use `git clone https://github.com/dapr/quickstarts.git` when using the edge version of dapr runtime.
