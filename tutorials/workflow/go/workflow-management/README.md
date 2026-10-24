# Workflow Management

This tutorial demonstrates the various APIs to manage a workflow instance. These methods include:

- Scheduling a workflow instance
- Getting a workflow instance state
- Suspending a workflow instance
- Resuming a workflow instance
- Terminating a workflow instance
- Purging a workflow instance

For more information on workflow management, see the [Dapr docs](https://docs.dapr.io/developing-applications/building-blocks/workflow/howto-manage-workflow/).

## Inspect the code

Open the `main.go` file in the `tutorials/workflow/go/workflow-management/workflowmanagement` folder. This file contains the endpoint definitions that use the workflow client to manage a workflow instance.

Open the `workflow.go` file in the same folder. The workflow that is being managed is named `NeverEndingWorkflow`. It is a counter that keeps running once it starts. Each cycle sends a notification, waits two seconds, and restarts itself with `ContinueAsNew`.

## Run the tutorial

1. Use a terminal to navigate to the `tutorials/workflow/go/workflow-management` folder.
2. Use the Dapr CLI to run the Dapr Multi-App run file. The first run downloads the Go dependencies, which can take a minute.

    <!-- STEP
    name: Run multi app run template
    expected_stdout_lines:
    - 'Started Dapr with app id "neverendingworkflow"'
    expected_stderr_lines:
    working_dir: .
    output_match_mode: substring
    background: true
    sleep: 60
    timeout_seconds: 120
    -->
    ```bash
    dapr run -f .
    ```
    <!-- END_STEP -->

3. Use the first POST request in the [`workflowmanagement.http`](./workflowmanagement.http) file to start the workflow, or use this cURL command:

    ```bash
    curl -i --request POST http://localhost:5262/start/0
    ```

    Note the `instance_id` property in the response. This property contains the workflow instance ID. Use this ID in the next requests.

    The workflow starts with the counter `0`. The expected app logs are as follows. A new line appears every two seconds:

    ```text
    send_notification: Received input: 0.
    send_notification: Received input: 1.
    send_notification: Received input: 2.
    ```

4. Use other requests in the [`workflowmanagement.http`](./workflowmanagement.http) file to perform other actions on the workflow, such as:
   - Getting the workflow instance state.
   - Suspending & resuming the workflow instance.
   - Terminating the workflow instance.
   - Purging the workflow instance.

   With cURL, replace `<INSTANCEID>` with the `instance_id` from step 3:

    ```bash
    curl --request GET --url http://localhost:5262/status/<INSTANCEID>
    curl --request POST --url http://localhost:5262/suspend/<INSTANCEID>
    curl --request POST --url http://localhost:5262/resume/<INSTANCEID>
    curl --request POST --url http://localhost:5262/terminate/<INSTANCEID>
    curl --request DELETE --url http://localhost:5262/purge/<INSTANCEID>
    ```

    While the instance is suspended, the app logs stop. After you resume it, they continue. Purge only works on an instance that is terminated or completed.

5. Stop the Dapr Multi-App run process by pressing `Ctrl+C`.

## Run without Docker

By default, the tutorial uses Redis in Docker as the workflow state store, and the Dapr Placement and Scheduler services in Docker. You can run the tutorial without Docker and Redis and instead run the Dapr binaries as processes, and use an SQLite file to keep the workflow state.

Use this option when Docker is not available or not allowed, for example on a locked-down laptop, in a CI job, or in a dev container without Docker. It also starts faster, because it has fewer moving parts.

The commands are for Linux and macOS, and for Windows (PowerShell).

### Prerequisites without Docker and Redis

- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/). You do not need `dapr init` with Docker. Step 1 installs the binaries.
- [Go](https://go.dev/doc/install)
- SQLite needs no install. `daprd` includes the SQLite state store.

1. Install the Dapr binaries with `dapr init --slim`. This command installs `daprd`, `placement`, and `scheduler` in `$HOME/.dapr/bin` (`$env:USERPROFILE\.dapr\bin` on Windows, with the `.exe` extension). It does not start them.
2. Open a terminal in this folder and start the Scheduler service.

    Linux and macOS:

    ```bash
    $HOME/.dapr/bin/scheduler --etcd-data-dir ./scheduler-data
    ```

    Windows (PowerShell):

    ```powershell
    & "$env:USERPROFILE\.dapr\bin\scheduler.exe" --etcd-data-dir .\scheduler-data --port 6060
    ```

    On Windows, `dapr run` connects to the Scheduler service on port 6060 and to the Placement service on port 6050. On Linux and macOS, it uses ports 50006 and 50005. For this reason, the Windows commands set `--port`.

3. Open a second terminal in this folder and start the Placement service. It uses other ports than the Scheduler service, which uses ports 8080 and 9090 by default.

    Linux and macOS:

    ```bash
    $HOME/.dapr/bin/placement --healthz-port 8081 --metrics-port 9091
    ```

    Windows (PowerShell):

    ```powershell
    & "$env:USERPROFILE\.dapr\bin\placement.exe" --healthz-port 8081 --metrics-port 9091 --port 6050
    ```

    On Dapr 1.19 and later, you can skip this step. Then add `--placement-enabled=true` to the Scheduler command in step 2.

4. Open a third terminal in this folder and run the tutorial with the run file `dapr-sqlite.yaml`:

    ```bash
    dapr run -f dapr-sqlite.yaml
    ```

    Then follow steps 3 to 5 of the section "Run the tutorial".

`dapr-sqlite.yaml` is the same as `dapr.yaml`, but its `resourcesPath` points to the [`resources-sqlite`](../../resources-sqlite/) folder. That folder has a SQLite state store with `actorStateStore` set to `"true"`.

## Files

```
workflow-management/
├── README.md                 # this file
├── dapr.yaml                 # `dapr run -f .` config (appID, resources, command)
├── dapr-sqlite.yaml          # same, with the SQLite state store
├── workflowmanagement.http   # the requests of this tutorial
├── makefile                  # wires the tutorial into `make validate`
├── go.mod                    # module and dependencies
├── go.sum
└── workflowmanagement/
    ├── main.go               # registry, worker, and the management endpoints
    └── workflow.go           # the never-ending workflow and its activity
```
