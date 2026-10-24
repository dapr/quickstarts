# Using the Dapr Workflow API with Java

This folder contains tutorials of using the Dapr Workflow API with Java and Spring Boot. All examples can be run locally on your machine.

Before you start, it's recommended to read though the Dapr docs to get familiar with the many [Workflow features, concepts, and patterns](https://docs.dapr.io/developing-applications/building-blocks/workflow/).

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/). The tutorials use Testcontainers to start the Dapr sidecar and its services, so they need Docker.
- [Java 17 or later](https://openjdk.org/install/) and [Apache Maven](https://maven.apache.org/install.html).
- Optional: An IDE such as [VSCode](https://code.visualstudio.com/download) with a [REST client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).

You do not need `dapr init`. Each tutorial runs with `mvn spring-boot:test-run`.

## Tutorials

- [Workflow Basics](./fundamentals/README.md)
- [Task Chaining](./task-chaining/README.md)
- [Fan-out/Fan-in](./fan-out-fan-in/README.md)
- [Monitor](./monitor-pattern/README.md)
- [External Events](./external-system-interactions/README.md)
- [Child Workflows](./child-workflows/README.md)
- [Resiliency & Compensation](./resiliency-and-compensation/README.md)
- [Combined Patterns](./combined-patterns/README.md)
- [Workflow Management](./workflow-management/README.md)
- [Versioning](./versioning/README.md)
- [History Propagation](./history-propagation/README.md)
- [Challenges & Tips](./challenges-tips/README.md)
