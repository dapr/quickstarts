# Using the Dapr Workflow API with C#

This folder contains tutorials of using the Dapr Workflow API with C#. All examples can be run locally on your machine.

Before you start, it's recommended to read though the Dapr docs to get familiar with the many [Workflow features, concepts, and patterns](https://docs.dapr.io/developing-applications/building-blocks/workflow/).

## Prerequisites

### With Docker and Redis (default)

- [Docker Desktop](https://www.docker.com/products/docker-desktop/).
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/) & [Initialization](https://docs.dapr.io/getting-started/install-dapr-selfhost/)
- [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0)
- Optional: An IDE such as [VSCode](https://code.visualstudio.com/download) with a [REST client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).

### Without Docker, with SQLite

To run the tutorials without Docker, see [Run the tutorials without Docker](#run-the-tutorials-without-docker). You need:

- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/). You do not need `dapr init` with Docker. Step 1 of the section installs the binaries.
- [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0)
- SQLite needs no install. `daprd` includes the SQLite state store.
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

By default, the tutorials use Redis in Docker as the workflow state store, and the Dapr Placement and Scheduler services in Docker. You can run the tutorials without Docker and Redis and instead run the Dapr binaries as processes, and use an SQLite file to keep the workflow state.

Use this option when Docker is not available or not allowed, for example on a locked-down laptop, in a CI job, or in a dev container without Docker. It also starts faster, because it has fewer moving parts.

The [Combined Patterns](./combined-patterns/README.md) tutorial also uses Redis for pub/sub, so it does not run this way. The [History Propagation](./history-propagation/README.md) and Versioning tutorials do not have a `dapr-sqlite.yaml` file. The commands are for Linux and macOS, and for Windows (PowerShell).

1. Install the Dapr binaries. This command installs `daprd`, `placement`, and `scheduler` in `$HOME/.dapr/bin` (`$env:USERPROFILE\.dapr\bin` on Windows, with the `.exe` extension). It does not start them.

    ```bash
    dapr init --slim
    ```

2. Open a terminal in the `tutorials/workflow/csharp` folder and start the Scheduler service.

    Linux and macOS:

    ```bash
    $HOME/.dapr/bin/scheduler --etcd-data-dir ./scheduler-data
    ```

    Windows (PowerShell):

    ```powershell
    & "$env:USERPROFILE\.dapr\bin\scheduler.exe" --etcd-data-dir .\scheduler-data --port 6060
    ```

    On Windows, `dapr run` connects to the Scheduler service on port 6060 and to the Placement service on port 6050. On Linux and macOS, it uses ports 50006 and 50005. For this reason, the Windows commands set `--port`.

3. Open a second terminal in the same folder and start the Placement service. The Placement service and the Scheduler service both use ports 8080 and 9090 by default, so this command sets other ports.

    Linux and macOS:

    ```bash
    $HOME/.dapr/bin/placement --healthz-port 8081 --metrics-port 9091
    ```

    Windows (PowerShell):

    ```powershell
    & "$env:USERPROFILE\.dapr\bin\placement.exe" --healthz-port 8081 --metrics-port 9091 --port 6050
    ```

    On Dapr 1.19 and later, you can skip this step. Then add `--placement-enabled=true` to the Scheduler command in step 2. The Scheduler service then serves actor placement.

4. Follow the steps in the README of the tutorial, but start the app with the run file `dapr-sqlite.yaml` instead of `dapr.yaml`. For example, in the `fundamentals` folder:

    ```bash
    dapr run -f dapr-sqlite.yaml
    ```

    `dapr-sqlite.yaml` is the same as `dapr.yaml`, but its `resourcesPath` points to the [`resources-sqlite`](../resources-sqlite/) folder. That folder has a SQLite state store with `actorStateStore` set to `"true"`. `dapr run` connects to the Placement and Scheduler services on their default ports: 50005 and 50006 on Linux and macOS, 6050 and 6060 on Windows. The Windows commands above set these ports.

To start again with no workflow state, stop all processes and delete the `scheduler-data` folder and the `workflows.db` files in the app folders.
