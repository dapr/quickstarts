# Dapr workflows

Run an order-processing workflow using the Dapr JavaScript SDK. Like the [C# quickstart](../../csharp/sdk/README.md), this sample seeds a state store, schedules an order, waits for it to start, and checks its completion and result.

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

1. Install the pinned dependencies and build the TypeScript app:

<!-- STEP
name: Build order processor
-->

```bash
npm ci
npm run build
```

<!-- END_STEP -->

2. Run the console app with Dapr:

<!-- STEP
name: Run order processor
expected_stdout_lines:
  - 'Workflow runtime started successfully'
  - 'Workflow started with the expected order'
  - 'There are 10 car in stock'
  - 'Payment of 5000 for 1 car processed successfully'
  - 'there are now 9 car in stock'
  - 'processed successfully!'
  - 'Workflow Status: COMPLETED'
  - 'Workflow result: {"processed":true}'
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

The app purchases one car for 5000 from an initial stock of ten. The order does not require approval. The output includes:

```text
Workflow started with the expected order
There are 10 car in stock
Payment of 5000 for 1 car processed successfully
Workflow Status: COMPLETED
Workflow result: {"processed":true}
```

Order IDs and SDK logs vary. The README validation checks stable messages, including the remaining stock of nine and the deserialized workflow result, rather than a particular ID or log format. The app rejects missing states, unsuccessful terminal statuses, mismatched input, and an unprocessed result instead of reporting them as success.

3. Stop the multi-app runner:

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
curl --fail --silent --show-error --request POST http://localhost:3500/v1.0/invoke/order-processor-sdk/method/start-workflow
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
curl --fail --silent --show-error --request POST http://localhost:3500/v1.0/invoke/order-processor-sdk/method/start-workflow
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

1. The worker connects to Dapr before the app schedules the workflow.
2. The app saves ten cars in `statestore`, then schedules an order for one car.
3. The app waits for the workflow to start and reads its typed input with `getInput<OrderPayload>()`.
4. The workflow notifies the user, verifies inventory, processes payment, updates inventory, and sends a completion notification.
5. The app waits for completion, compares `runtimeStatus` with `WorkflowRuntimeStatus.COMPLETED`, and reads the typed result with `getOutput<OrderResult>()`.

Workflow code is a generator that yields durable tasks, not ordinary JavaScript promises. It uses `ctx.logger` for replay-safe logging; activity logs use `console.log` because activities are not replayed with the workflow history.

As in the C# sample, insufficient inventory or a rejected approval returns `{ "processed": false }`. If updating inventory fails after payment, the workflow reports that a refund is needed and returns an unprocessed result. Payment and refund notifications are simulations, not real financial transactions.

### Approval events

The default order and README checks exercise the successful purchase without approval, matching the C# quickstart. To explore approval, change the order in `orderProcessor.ts` to two cars costing 10000. The workflow then waits for **`ApprovalEvent`** with an **`{ "isApproved": true }`** or **`{ "isApproved": false }`** payload.

This uses the SDK's durable `waitForExternalEvent` timeout (`timeoutInSeconds: 30`), rather than manually racing a timer. As in C#, an unanswered approval times out and fails the workflow. A rejection completes the workflow with an unprocessed result, which the sample app reports as an error.

With either service template, use the logged workflow instance ID to send approval from another terminal within 30 seconds:

```bash
curl --fail --request POST --header "Content-Type: application/json" --data '{"isApproved":true}' http://localhost:3500/v1.0/workflows/dapr/INSTANCE_ID/raiseEvent/ApprovalEvent
```

You can also call `DaprWorkflowClient.raiseEvent(instanceId, "ApprovalEvent", { isApproved: true })` from a client connected to the same sidecar. See the [raise event API](https://docs.dapr.io/reference/api/workflow_api/#raise-event-request).

### View workflow traces

If the Zipkin container installed by `dapr init` is running, open http://localhost:9411 and find the `order-processor-sdk` traces to inspect workflow and activity execution.
