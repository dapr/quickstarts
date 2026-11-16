# Using the Dapr Workflow API with Go

This folder contains tutorials of using the Dapr Workflow API with Go. All examples can be run locally on your machine.

Before you start, it's recommended to read though the Dapr docs to get familiar with the many [Workflow features, concepts, and patterns](https://docs.dapr.io/developing-applications/building-blocks/workflow/).

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/), or the steps in the tutorial to run without Docker.
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/) & [Initialization](https://docs.dapr.io/getting-started/install-dapr-selfhost/)
- [Go](https://go.dev/doc/install). The version is in the `go.mod` file of the tutorial.

## Optional: Dapr Dev Dashboard

The free [Dapr Dev Dashboard](https://docs.dapr.io/developing-applications/local-development/dapr-dev-dashboard/) lists the workflow instances of your running apps with their status, input and output, and the full event history of each run. It is useful for every tutorial below.

1. [Install the dashboard](https://github.com/diagridio/dev-dashboard#installation-instructions), then start it in a separate terminal while a tutorial is running:

    ```sh
    diagrid-dev-dashboard
    ```

    This opens http://localhost:9090 in your browser.

2. Go to the **Workflows** page and select an instance to follow its execution.

The Dev Dashboard is a local development tool. It is not intended for Kubernetes, production, or any shared environment.

## Tutorials

- [History Propagation](./history-propagation/README.md)
