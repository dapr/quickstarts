# Using the Dapr Workflow API with Go

This folder contains tutorials of using the Dapr Workflow API with Go. All examples can be run locally on your machine.

Before you start, it's recommended to read though the Dapr docs to get familiar with the many [Workflow features, concepts, and patterns](https://docs.dapr.io/developing-applications/building-blocks/workflow/).

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/), or the steps in the tutorial to run without Docker.
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/) & [Initialization](https://docs.dapr.io/getting-started/install-dapr-selfhost/)
- [Go](https://go.dev/doc/install). The version is in the `go.mod` file of the tutorial.

## Tutorials

- [Workflow Basics](./fundamentals/README.md)
- [Task Chaining](./task-chaining/README.md)
- [Fan-out/Fan-in](./fan-out-fan-in/README.md)
- [Monitor](./monitor-pattern/README.md)
- [External Events](./external-system-interaction/README.md)
- [Child Workflows](./child-workflows/README.md)
- [Resiliency & Compensation](./resiliency-and-compensation/README.md)
- [Combined Patterns](./combined-patterns/README.md)
- [Workflow Management](./workflow-management/README.md)
- [Versioning](./versioning/README.md)
- [History Propagation](./history-propagation/README.md)
- [Challenges & Tips](./challenges-tips/README.md)
