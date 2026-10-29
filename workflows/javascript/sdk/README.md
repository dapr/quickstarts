# Dapr workflows

Run an order-processing workflow using the Dapr JavaScript SDK. The sample seeds a state store, starts an order that needs approval, and waits for it to finish. You can stop and restart the app while the order waits, and the workflow continues from its history.

See the [Dapr workflow overview](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/) for background.

This sample pins `@dapr/dapr` to 3.19.0. Use Node.js 20 or newer (required by the SDK's transport dependency) and an initialized Dapr installation (`dapr init`) with Redis running on `localhost:6379`. It is validated with Dapr runtime 1.19.0.

The workflow uses five activities:

- `notifyActivity` prints order notifications.
- `verifyInventoryActivity` checks whether the state store contains enough inventory.
- `requestApprovalActivity` requests approval for orders costing more than 5000.
- `processPaymentActivity` simulates a successful payment.
- `updateInventoryActivity` removes purchased items from the inventory.

### Run with the multi-app template (`dapr run -f .`)

Open a terminal in `workflows/javascript/sdk`. Run all the following commands from that directory.

1. Set an order ID. The app uses it as the workflow instance ID:

    ```bash
    export ORDER_ID=order-$(date +%Y%m%d-%H%M%S)
    ```

    Windows (PowerShell):

    ```powershell
    $env:ORDER_ID = "order-$(Get-Date -Format yyyyMMdd-HHmmss)"
    ```

2. Install the pinned dependencies and build the TypeScript app:

<!-- STEP
name: Build order processor
-->

```bash
npm ci
npm run build
```

<!-- END_STEP -->

3. Run the console app with Dapr:

<!-- STEP
name: Run order processor
env:
  ORDER_ID: order-validate
expected_stdout_lines:
  - 'Workflow runtime started successfully'
  - 'Order ID: order-validate'
  - 'Started order order-validate.'
  - 'Received order order-validate for 2 car at a total cost of 10000'
  - 'There are 10 car in stock'
  - 'Approval requested for order order-validate. Waiting for approval.'
  - 'Payment of 10000 for 2 car processed successfully'
  - 'there are now 8 car in stock'
  - 'processed successfully!'
  - 'Workflow completed: COMPLETED'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 30
timeout_seconds: 120
-->

```bash
dapr run -f .
```

<!-- END_STEP -->

The app orders two cars at 5000 each, a total of 10000. An order over 5000 needs approval, so the workflow waits. The log shows these app lines, with SDK log lines between them. The order ID is the one that you set:

```text
Order ID: order-20261024-101500
Started order order-20261024-101500.
Received order order-20261024-101500 for 2 car at a total cost of 10000
There are 10 car in stock
Approval requested for order order-20261024-101500. Waiting for approval.
```

4. Stop the app with Ctrl+C. The order is still waiting for approval.

5. Start the app again in the same terminal. `ORDER_ID` is still set:

    ```bash
    dapr run -f .
    ```

    The log shows `Order order-20261024-101500 is already running. Waiting for it to finish.` The app does not start a new order and does not add stock again. The steps before the approval do not run again.

6. In a second terminal, set `ORDER_ID` to the order ID that the app printed (`export ORDER_ID=<id>`, or `$env:ORDER_ID = "<id>"` in PowerShell). Then approve the order:

<!-- STEP
name: Approve the order
env:
  ORDER_ID: order-validate
sleep: 15
-->

```bash
dapr workflow raise-event $ORDER_ID/ApprovalEvent --app-id order-processor --input '{"approved": true}'
```

<!-- END_STEP -->

7. The first terminal shows the payment, the inventory update, and the last line:

    ```text
    Payment of 10000 for 2 car processed successfully
    Inventory updated for order-20261024-101500, there are now 8 car in stock
    Order order-20261024-101500 processed successfully!
    Workflow completed: COMPLETED
    ```

In step 5, the steps that finished before the stop (the notification, the inventory check, and the approval request) did not run again. The workflow continued from its history. A step that was in progress when you stopped the app can run again.

The app waits up to 10 minutes for the approval. If the approval does not arrive, the workflow does not process the order. The app waits up to 15 minutes for the workflow to end. To start a new order, set a new `ORDER_ID`. If you start the app with an `ORDER_ID` whose workflow already ended, the app prints `Workflow completed: <status>` and exits.

8. Stop the multi-app runner:

<!-- STEP
name: Stop order processor
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->

The console app closes its worker and clients after completion. To run the executable README checks yourself, use `make validate` in this directory.

### Run as a service

The same workflow can also be hosted by Express, either directly or through `DaprServer`. Both entry points share the console app's workflow registration and order lifecycle. Install and build as above first; the templates run the compiled app directly so Dapr manages the Node.js process without an intervening npm process. Run only one template at a time because the service templates use the same ports and app ID.

#### Express

<!-- STEP
name: Run Express order processor
expected_stdout_lines:
  - 'Workflow runtime started successfully'
  - 'There are 10 car in stock'
  - 'there are now 9 car in stock'
  - 'Workflow Status: COMPLETED'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 15
timeout_seconds: 120
-->

```bash
dapr run -f dapr-AppWithExpressServer.yaml
```

<!-- END_STEP -->

After `Workflow runtime started successfully` appears, send a request from a second terminal. Each request resets the demo inventory to ten cars, so send requests sequentially. These are alternative hosting examples, not a concurrent inventory-management service.

<!-- STEP
name: Invoke Express order processor
expected_stdout_lines:
  - 'Workflow result: {"processed":true}'
output_match_mode: substring
timeout_seconds: 90
-->

```bash
curl --fail --silent --show-error --request POST http://localhost:3500/v1.0/invoke/order-processor/method/start-workflow
```

<!-- END_STEP -->

Stop the Express template before trying the other hosting option:

<!-- STEP
name: Stop Express order processor
-->

```bash
dapr stop -f dapr-AppWithExpressServer.yaml
```

<!-- END_STEP -->

#### Express hosted by DaprServer

<!-- STEP
name: Run DaprServer order processor
expected_stdout_lines:
  - 'Workflow runtime started successfully'
  - 'There are 10 car in stock'
  - 'there are now 9 car in stock'
  - 'Workflow Status: COMPLETED'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 15
timeout_seconds: 120
-->

```bash
dapr run -f dapr-AppWithDaprServer.yaml
```

<!-- END_STEP -->

After the worker is ready, invoke it from a second terminal:

<!-- STEP
name: Invoke DaprServer order processor
expected_stdout_lines:
  - 'Workflow result: {"processed":true}'
output_match_mode: substring
timeout_seconds: 90
-->

```bash
curl --fail --silent --show-error --request POST http://localhost:3500/v1.0/invoke/order-processor/method/start-workflow
```

<!-- END_STEP -->

Stop the DaprServer template:

<!-- STEP
name: Stop DaprServer order processor
-->

```bash
dapr stop -f dapr-AppWithDaprServer.yaml
```

<!-- END_STEP -->
### What happened?

1. The worker connects to Dapr before the app starts the workflow.
2. The app saves ten cars in `statestore` only when the inventory is absent. A restart does not add stock again.
3. The app reads `ORDER_ID` and gets the state of the workflow instance with that ID. When the instance does not exist, the app schedules it with `scheduleNewWorkflow`. When the instance is running, the app waits for it. When the instance ended, the app prints its status and exits.
4. The workflow notifies the user, verifies inventory, and requests approval because the total is over 5000. It then waits for the external event `ApprovalEvent`.
5. After the approval, the workflow processes payment, updates inventory, and sends a completion notification.
6. The app waits for the workflow to end and prints `Workflow completed: <status>`.

Workflow code is a generator that yields durable tasks, not ordinary JavaScript promises. The workflow function does not print, because Dapr runs it again from its history when the app restarts. Activity logs use `console.log` because an activity that finished is not run again.

Insufficient inventory or a rejected approval returns `{ "processed": false }`. If updating inventory fails after payment, the workflow reports that a refund is needed and returns an unprocessed result. Payment and refund notifications are simulations, not real financial transactions.

### Approval events

The workflow waits for **`ApprovalEvent`** with an **`{ "approved": true }`** or **`{ "approved": false }`** payload. The wait uses the SDK's durable `waitForExternalEvent` timeout (`timeoutInSeconds: 600`), rather than manually racing a timer. An unanswered approval times out after 10 minutes and fails the workflow. A rejection completes the workflow with an unprocessed result.

Send the approval with the Dapr CLI, as in step 6:

```bash
dapr workflow raise-event $ORDER_ID/ApprovalEvent --app-id order-processor --input '{"approved": true}'
```

You can also call `DaprWorkflowClient.raiseEvent(orderId, "ApprovalEvent", { approved: true })` from a client connected to the same sidecar. See the [raise event API](https://docs.dapr.io/reference/api/workflow_api/#raise-event-request).

The Express and DaprServer templates start a different order: one car for 5000. This order does not need approval.

### Run without Docker

By default, the quickstart uses Redis in Docker as the workflow state store, and the Dapr Placement and Scheduler services in Docker. You can run the quickstart without Docker and Redis and instead run the Dapr binaries as processes, and use an SQLite file to keep the workflow state.

Use this option when Docker is not available or not allowed, for example on a locked-down laptop, in a CI job, or in a dev container without Docker. It also starts faster, because it has fewer moving parts.

The commands are for Linux and macOS, and for Windows (PowerShell).

#### Prerequisites without Docker and Redis

- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/). You do not need `dapr init` with Docker. Step 1 installs the binaries.
- [Node.js](https://nodejs.org/en/download/)
- SQLite needs no install. `daprd` includes the SQLite state store.

1. Install the Dapr binaries. This command installs `daprd`, `placement`, and `scheduler` in `$HOME/.dapr/bin` (`$env:USERPROFILE\.dapr\bin` on Windows, with the `.exe` extension). It does not start them.

    ```sh
    dapr init --slim
    ```

2. Open a terminal in this quickstart directory and start the Scheduler service.

    Linux and macOS:

    ```sh
    $HOME/.dapr/bin/scheduler --etcd-data-dir ./scheduler-data
    ```

    Windows (PowerShell):

    ```powershell
    & "$env:USERPROFILE\.dapr\bin\scheduler.exe" --etcd-data-dir .\scheduler-data --port 6060
    ```

    On Windows, `dapr run` connects to the Scheduler service on port 6060 and to the Placement service on port 6050. On Linux and macOS, it uses ports 50006 and 50005. For this reason, the Windows commands set `--port`.

3. Open a second terminal in the same directory and start the Placement service. The Placement service and the Scheduler service both use ports 8080 and 9090 by default, so this command sets other ports.

    Linux and macOS:

    ```sh
    $HOME/.dapr/bin/placement --healthz-port 8081 --metrics-port 9091
    ```

    Windows (PowerShell):

    ```powershell
    & "$env:USERPROFILE\.dapr\bin\placement.exe" --healthz-port 8081 --metrics-port 9091 --port 6050
    ```

    On Dapr 1.19 and later, you can skip this step. Then add `--placement-enabled=true` to the Scheduler command in step 2. The Scheduler service then serves actor placement.

4. Open a third terminal in the same directory and set an order ID:

    Linux and macOS:

    ```sh
    export ORDER_ID=order-$(date +%Y%m%d-%H%M%S)
    ```

    Windows (PowerShell):

    ```powershell
    $env:ORDER_ID = "order-$(Get-Date -Format yyyyMMdd-HHmmss)"
    ```

5. Install the dependencies, build the app, and run it with the run file `dapr-sqlite.yaml`:

    ```sh
    npm install
    npm run build
    dapr run -f dapr-sqlite.yaml
    ```

    The log shows `Order ID: <id>`, `Started order <id>.`, the steps before the approval, and `Approval requested for order <id>. Waiting for approval.`

6. Stop the app with Ctrl+C.

7. Start the app again in the same terminal. `ORDER_ID` is still set:

    ```sh
    dapr run -f dapr-sqlite.yaml
    ```

    The log shows `Order <id> is already running. Waiting for it to finish.` The steps before the approval do not run again.

8. In a fourth terminal, set `ORDER_ID` to the order ID that the app printed (`export ORDER_ID=<id>`, or `$env:ORDER_ID = "<id>"` in PowerShell). Then approve the order:

    ```sh
    dapr workflow raise-event $ORDER_ID/ApprovalEvent --app-id order-processor --input '{"approved": true}'
    ```

9. The first terminal shows the payment, the inventory update, and `Workflow completed: COMPLETED`.

The steps that finished before the stop did not run again. The workflow continued from its history in the SQLite file. A step that was in progress when you stopped the app can run again.

`dapr-sqlite.yaml` is the same as `dapr.yaml`, but its `resourcesPath` points to the [`components-sqlite`](../../components-sqlite/) folder. That folder has a SQLite state store with `actorStateStore` set to `"true"`. The expected output is the same as in the steps above. The other run files in this folder, `dapr-AppWithExpressServer.yaml` and `dapr-AppWithDaprServer.yaml`, still use Redis.

To start again with no workflow state, stop all processes and delete the `scheduler-data` folder and the `workflows.db` file in the `order-processor` folder.

### View workflow traces

If the Zipkin container installed by `dapr init` is running, open http://localhost:9411 and find the `order-processor` traces to inspect workflow and activity execution.
