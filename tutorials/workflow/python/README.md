# Using the Dapr Workflow API with Python

This folder contains tutorials of using the Dapr Workflow API with Python. All examples can be run locally on your machine.

Before you start, it's recommended to read though the Dapr docs to get familiar with the many [Workflow features, concepts, and patterns](https://docs.dapr.io/developing-applications/building-blocks/workflow/).

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/). To run the tutorials without Docker, see [Run the tutorials without Docker](#run-the-tutorials-without-docker).
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/) & [Initialization](https://docs.dapr.io/getting-started/install-dapr-selfhost/)
- [Python 3](https://www.python.org/downloads/)
- Optional: An IDE such as [VSCode](https://code.visualstudio.com/download) with a [REST client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).

## Tutorials

- [Workflow Basics](./fundamentals/README.md)
- [Task Chaining](./task-chaining/README.md)
- [Fan-out/Fan-in](./fan-out-fan-in/README.md)
- [Monitor](./monitor-pattern/README.md)
- [External Events](./external-system-interaction/README.md)
- [Child Workflows](./child-workflows/README.md)
- [Resiliency & Compensation](./resiliency-and-compensation/README.md)
- [Combined Patterns](./combined-patterns/README.md)
- [WorkflowManagement](./workflow-management/README.md)
- [Challenges & Tips](./challenges-tips/README.md)

## Run the tutorials without Docker

The tutorials use Redis in Docker as the workflow state store, and the Dapr Placement and Scheduler services in Docker. You can run them without Docker and Redis instead. The Dapr binaries then run as processes, and a SQLite file keeps the workflow state.

The [Combined Patterns](./combined-patterns/README.md) tutorial also uses Redis for pub/sub, so it does not run this way. The commands below are for Linux and macOS.

1. Install the Dapr binaries. This command installs `daprd`, `placement`, and `scheduler` in `$HOME/.dapr/bin`. It does not start them.

    ```bash
    dapr init --slim
    ```

2. Open a terminal in the `tutorials/workflow/python` folder and start the Scheduler service:

    ```bash
    $HOME/.dapr/bin/scheduler --etcd-data-dir ./scheduler-data
    ```

3. Open a second terminal in the same folder and start the Placement service. The Placement service and the Scheduler service both use ports 8080 and 9090 by default, so this command sets other ports:

    ```bash
    $HOME/.dapr/bin/placement --healthz-port 8081 --metrics-port 9091
    ```

    On Dapr 1.19 and later, you can skip this step. Then add `--placement-enabled=true` to the Scheduler command in step 2. The Scheduler service then serves actor placement.

4. In the folder of the tutorial, open `dapr.yaml` and change `resourcesPath: ../../resources` to `resourcesPath: ../../resources-sqlite`. The [`resources-sqlite`](../resources-sqlite/) folder has a SQLite state store with `actorStateStore` set to `"true"`.

5. Follow the steps in the README of the tutorial. `dapr run -f .` connects to the Placement and Scheduler services on their default ports, 50005 and 50006.

To start again with no workflow state, stop all processes and delete the `scheduler-data` folder and the `workflows.db` files in the app folders.
