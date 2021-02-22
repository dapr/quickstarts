# Dapr Quickstarts

[![Build Status](https://github.com/dapr/quickstarts/workflows/samples/badge.svg?event=push&branch=master)](https://github.com/dapr/quickstarts/actions?workflow=samples)
[![Join the chat at https://gitter.im/Dapr/samples](https://badges.gitter.im/Dapr/samples.svg)](https://gitter.im/Dapr/samples?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This repository contains a collection of tutorials with code samples that are aimed to get you started quickly with Dapr, each highlighting a different Dapr capability. 

## How to use this repository

If you are new to Dapr and haven't done so already, it is recommended you go through the Dapr [Getting Started](https://docs.dapr.io/getting-started/install-dapr/) instructions.

This repository is designed to help you explore different Dapr capabilities and you can go through the quickstarts based on the areas you would like to explore. Each quickstart includes sample code and a tutorial that will guide you through it. 

* A good place to start is the [hello-world](./hello-world) quickstart, it demonstrates how to run Dapr in standalone mode locally on your machine and demonstrates state management and service invocation in a simple application. 
* Next, if you are familiar with Kubernetes and want to see how to run the same application in a Kubernetes environment, look for the *hello-kubernetes* quickstart. Other quickstarts such as *pub-sub*, *bindings* and the *distributed-calculator* quickstart explore different Dapr capabilities include instructions for running both locally and on Kubernetes and can be completed in any order. A full list of the quickstarts can be found [below](#quickstarts).
* At anytime, you can explore the [Dapr documentation](https://docs.dapr.io/) or [SDK specific samples](#sdks) and come back to try additional quickstarts. 
* When you're done, consider exploring the [Dapr samples repository](https://github.com/dapr/samples) for additional code samples contributed by the community that show more advanced or specific usages of Dapr.

## Supported Dapr Runtime version

Dapr is currently under community development with preview releases. The master branch includes breaking changes, therefore ensure that you're running the samples with the right version of Dapr runtime.

| Dapr Quickstart Version  | Dapr Runtime Version |
|:--------------------:|:--------------------:|
| [v1.0.0](https://github.com/dapr/quickstarts/tree/v1.0.0) | [v1.0.0](https://github.com/dapr/dapr/tree/v1.0.0) |
| [v0.11.0](https://github.com/dapr/quickstarts/tree/v0.11.0) | [v0.11.3](https://github.com/dapr/dapr/tree/v0.11.3) |
| [v0.10.0](https://github.com/dapr/quickstarts/tree/v0.10.0) | [v0.10.0](https://github.com/dapr/dapr/tree/v0.10.0) |
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
| [Hello-world](./hello-world)            | Demonstrates how to run Dapr locally. Highlights service invocation and state management.                                                                                                      |
| [Hello-kubernetes](./hello-kubernetes)       | Demonstrates how to run Dapr in Kubernetes. Highlights service invocation and state management.                                                                                                |
| [Distributed-calculator](./distributed-calculator) | Demonstrates a distributed calculator application that uses Dapr services to power a React web app. Highlights polyglot (multi-language) programming, service invocation and state management. |
| [Pub-sub](./pub-sub)                | Demonstrates how to use Dapr to enable pub-sub applications. Uses Redis as a pub-sub component.                                                                                          |
| [Bindings](./bindings)            | Demonstrates how to use Dapr to create input and output bindings to other components. Uses bindings to Kafka.                                                                            |
| [Middleware](./middleware) | Demonstrates use of Dapr middleware to enable OAuth 2.0 authorization. |
| [Observability](./observability) | Demonstrates Dapr tracing capabilities. Uses Zipkin as a tracing component. |
| [Secret Store](./secretstore) | Demonstrates the use of Dapr Secrets API to access secret stores. |

## SDKs

Find SDK-specific samples in the links below:

- **[.NET SDK](https://github.com/dapr/dotnet-sdk)**
  - **[Getting Started with ASP.NET Core](https://github.com/dapr/dotnet-sdk/tree/master/samples/AspNetCore)** - Samples for developing ASP.NET applications using the Dapr .NET SDK
  - **[Getting Started with .NET Actors](https://github.com/dapr/dotnet-sdk/blob/master/docs/get-started-dapr-actor.md)** - Tutorial for developing actor applications using the Dapr .NET SDK including  **[actor samples](https://github.com/dapr/dotnet-sdk/tree/master/samples/Actor)**
- **[Java SDK](https://github.com/dapr/java-sdk)**
  - **[Examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples)** - Examples for developing Java applications using Dapr
  - **[Example for Java Actors](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/actors/http)** - Example for developing an actor application using the Java SDK.
- **[Go SDK](https://github.com/dapr/go-sdk)** 
  - **[Examples](https://github.com/dapr/go-sdk/tree/master/example#dapr-go-client-example)** using the client library to connect to Dapr API, and how to create a Dapr application in either HTTP or gRPC.
- **[Javascript SDK](https://github.com/dapr/js-sdk)**
  - **[Examples](https://github.com/dapr/js-sdk/tree/master/examples)** - Examples for developing Javascript applications using Dapr
- **[Python SDK](https://github.com/dapr/python-sdk)**
  - **[Examples](https://github.com/dapr/python-sdk/tree/master/examples)** - Examples for developing Python applications using Dapr
  - **[Example for Python Actors](https://github.com/dapr/python-sdk/tree/master/examples/demo_actor)** - Example for developing an actor application using the Python SDK.
  
  
To get started with the quickstarts, clone this repository and follow instructions in each sample:
```bash
git clone --depth=1 https://github.com/dapr/quickstarts.git
```
## Code of Conduct

Please refer to our [Dapr Community Code of Conduct](https://github.com/dapr/community/blob/master/CODE-OF-CONDUCT.md)
