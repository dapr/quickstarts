# Dapr workflows

In this quickstart, you'll run a console application to demonstrate Dapr's workflow programming model and the workflow management API. The console app starts and manages the lifecycle of a workflow that stores and retrieves data in a state store.

This quickstart includes 3 entry points demonstrating different ways to host a workflow:

1. JavaScript console app `order-processor` 
2. Express app `order-process-with-express-server`
3. Express app via Dapr Server `order-process-with-dapr-server`

The quickstart contains 1 workflow to simulate purchasing items from a store, and 5 unique activities within the workflow. These 5 activities are as follows:

- notifyActivity: This activity utilizes a logger to print out messages throughout the workflow. These messages notify the user when there is insufficient inventory, their payment couldn't be processed, and more.
- verifyInventoryActivity: This activity checks the state store to ensure that there is enough inventory present for purchase.
- requestApprovalActivity: This activity requests approval for orders over a certain threshold.
- processPaymentActivity: This activity is responsible for processing and authorizing the payment.
- updateInventoryActivity: This activity updates the state store with the new remaining inventory value.

### Run the order processor workflow with multi-app-run

1. Open a new terminal window and install the dependencies: 

<!-- STEP
name: build order-process app
-->

```bash
cd ./javascript/sdk
npm install
npm run build
```

<!-- END_STEP -->
2. Run the app 

- Entry point 1 : JavaScript console app
<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP - order-processor == Payment of 5000 for 1 car processed successfully'
  - 'there are now 9 car in stock'
  - 'processed successfully!'
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
timeout_seconds: 120
-->

```bash
dapr run -f .
```
<!-- END_STEP -->

- Entry point 2 : Express app

```bash
dapr run -f dapr-AppWithExpressServer.yaml
```

```bash
curl --request POST \
  --url http://localhost:3500/v1.0/invoke/order-processor/method/start-workflow
```

- Entry point 3 : Express app via Dapr Server

```bash
dapr run -f dapr-AppWithDaprServer.yaml
```
```bash
curl --request POST \
  --url http://localhost:3500/v1.0/invoke/order-processor/method/start-workflow
```

3. Expected output


```
== APP - order-processor == Starting new orderProcessingWorkflow instance with ID = f5087775-779c-4e73-ac77-08edfcb375f4
== APP - order-processor == Orchestration scheduled with ID: f5087775-779c-4e73-ac77-08edfcb375f4
== APP - order-processor == Waiting 30 seconds for instance f5087775-779c-4e73-ac77-08edfcb375f4 to complete...
== APP - order-processor == Received "Orchestrator Request" work item with instance id 'f5087775-779c-4e73-ac77-08edfcb375f4'
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Rebuilding local state with 0 history event...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, EXECUTIONSTARTED=1]
== APP - order-processor == Processing order f5087775-779c-4e73-ac77-08edfcb375f4...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Returning 1 action(s)
== APP - order-processor == Received "Activity Request" work item
== APP - order-processor == Received order f5087775-779c-4e73-ac77-08edfcb375f4 for 1 car at a total cost of 5000
== APP - order-processor == Activity notifyActivity completed with output undefined (0 chars)
== APP - order-processor == Received "Orchestrator Request" work item with instance id 'f5087775-779c-4e73-ac77-08edfcb375f4'
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Rebuilding local state with 3 history event...
== APP - order-processor == Processing order f5087775-779c-4e73-ac77-08edfcb375f4...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Returning 1 action(s)
== APP - order-processor == Received "Activity Request" work item
== APP - order-processor == Verifying inventory for f5087775-779c-4e73-ac77-08edfcb375f4 of 1 car
== APP - order-processor == 2025-02-13T10:33:21.622Z INFO [HTTPClient, HTTPClient] Sidecar Started
== APP - order-processor == There are 10 car in stock
== APP - order-processor == Activity verifyInventoryActivity completed with output {"success":true,"inventoryItem":{"itemName":"car","perItemCost":5000,"quantity":10}} (84 chars)
== APP - order-processor == Received "Orchestrator Request" work item with instance id 'f5087775-779c-4e73-ac77-08edfcb375f4'
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Rebuilding local state with 6 history event...
== APP - order-processor == Processing order f5087775-779c-4e73-ac77-08edfcb375f4...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Returning 1 action(s)
== APP - order-processor == Received "Activity Request" work item
== APP - order-processor == Processing payment for order car
== APP - order-processor == Payment of 5000 for 1 car processed successfully
== APP - order-processor == Activity processPaymentActivity completed with output true (4 chars)
== APP - order-processor == Received "Orchestrator Request" work item with instance id 'f5087775-779c-4e73-ac77-08edfcb375f4'
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Rebuilding local state with 9 history event...
== APP - order-processor == Processing order f5087775-779c-4e73-ac77-08edfcb375f4...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Returning 1 action(s)
== APP - order-processor == Received "Activity Request" work item
== APP - order-processor == Updating inventory for f5087775-779c-4e73-ac77-08edfcb375f4 of 1 car
== APP - order-processor == Inventory updated for f5087775-779c-4e73-ac77-08edfcb375f4, there are now 9 car in stock
== APP - order-processor == Activity updateInventoryActivity completed with output {"success":true,"inventoryItem":{"itemName":"car","perItemCost":5000,"quantity":9}} (83 chars)
== APP - order-processor == Received "Orchestrator Request" work item with instance id 'f5087775-779c-4e73-ac77-08edfcb375f4'
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Rebuilding local state with 12 history event...
== APP - order-processor == Processing order f5087775-779c-4e73-ac77-08edfcb375f4...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Returning 1 action(s)
== APP - order-processor == Received "Activity Request" work item
== APP - order-processor == order f5087775-779c-4e73-ac77-08edfcb375f4 processed successfully!
== APP - order-processor == Activity notifyActivity completed with output undefined (0 chars)
== APP - order-processor == Received "Orchestrator Request" work item with instance id 'f5087775-779c-4e73-ac77-08edfcb375f4'
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Rebuilding local state with 15 history event...
== APP - order-processor == Processing order f5087775-779c-4e73-ac77-08edfcb375f4...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - order-processor == Order f5087775-779c-4e73-ac77-08edfcb375f4 processed successfully!
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Orchestration completed with status COMPLETED
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Returning 1 action(s)
== APP - order-processor == Instance f5087775-779c-4e73-ac77-08edfcb375f4 completed
== APP - order-processor == Orchestration completed! Result: {"processed":true}
```

4. Stop Dapr workflow with CTRL-C or:

```sh
dapr stop -f .
```

### View workflow output with Zipkin

For a more detailed view of the workflow activities (duration, progress etc.), try using Zipkin.

1. Launch Zipkin container - The [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) docker container is launched on running `dapr init`. Check to make sure the container is running. If it's not, launch the Zipkin docker container with the following command.

```bash
docker run -d -p 9411:9411 openzipkin/zipkin
```

2. View Traces in Zipkin UI - In your browser go to http://localhost:9411 to view the workflow trace spans in the Zipkin web UI. The order-processor workflow should be viewable with the following output in the Zipkin web UI. 

<img src="img/workflow-trace-spans-zipkin.png">

### What happened? 

When you ran `dapr run -f .`

1. A unique order ID for the workflow is generated (in the above example, `f5087775-779c-4e73-ac77-08edfcb375f4`) and the workflow is scheduled.
2. The `notifyActivity` workflow activity sends a notification saying an order for 1 car has been received.
3. The `verifyInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock.
4. Your workflow starts and notifies you of its status.
5. The `requestApprovalActivity` workflow activity requests approval for order `f5087775-779c-4e73-ac77-08edfcb375f4`
6. The `processPaymentActivity` workflow activity begins processing payment for order `f5087775-779c-4e73-ac77-08edfcb375f4` and confirms if successful.
7. The `updateInventoryActivity` workflow activity updates the inventory with the current available cars after the order has been processed.
8. The `notifyActivity` workflow activity sends a notification saying that order `f5087775-779c-4e73-ac77-08edfcb375f4` has completed and processed.
9. The workflow terminates as completed and processed.

> **Note:** This quickstart uses an OrderPayload of one car with a total cost of $5000. Since the total order cost is not over 5000, the workflow will not call the `requestApprovalActivity` activity nor wait for an approval event. The dapr.yaml multi-app run file starts a console application and can't accept incoming events easily. The dapr-AppWithDaprServer.yaml and dapr-AppWithExpressServer.yaml files start a service that can accept incoming events. Use the [raise event API](https://docs.dapr.io/reference/api/workflow_api/#raise-event-request) via HTTP/gRPC or via the Dapr Workflow client in the server apps to send an event to the workflow.
