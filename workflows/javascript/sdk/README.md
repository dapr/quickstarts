# Dapr workflows

In this quickstart, you'll create a simple console application to demonstrate Dapr's workflow programming model and the workflow management API. The console app starts and manages the lifecycle of a workflow that stores and retrieves data in a state store.

This quickstart includes one project:

- JavaScript console app `order-processor` 

The quickstart contains 1 workflow to simulate purchasing items from a store, and 5 unique activities within the workflow. These 5 activities are as follows:

- notifyActivity: This activity utilizes a logger to print out messages throughout the workflow. These messages notify the user when there is insufficient inventory, their payment couldn't be processed, and more.
- reserveInventoryActivity: This activity checks the state store to ensure that there is enough inventory present for purchase.
- requestApprovalActivity: This activity requests approval for orders over a certain threshold
- processPaymentActivity: This activity is responsible for processing and authorizing the payment.
- updateInventoryActivity: This activity updates the state store with the new remaining inventory value.

### Run the order processor workflow with multi-app-run

1. Open a new terminal window and navigate to `order-processor` directory: 

<!-- STEP
name: build order-process app
-->

```bash
cd ./javascript/sdk
npm install
npm run build
```

<!-- END_STEP -->
2. Run the console app with Dapr: 

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP - workflowApp == == APP == Payment of 100 for 10 item1 processed successfully'
  - 'there are now 90 item1 in stock'
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

3. Expected output


```
== APP - workflowApp == == APP == Orchestration scheduled with ID: 0c332155-1e02-453a-a333-28cfc7777642
== APP - workflowApp == == APP == Waiting 30 seconds for instance 0c332155-1e02-453a-a333-28cfc7777642 to complete...
== APP - workflowApp == == APP == Received "Orchestrator Request" work item with instance id '0c332155-1e02-453a-a333-28cfc7777642'
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Rebuilding local state with 0 history event...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, EXECUTIONSTARTED=1]
== APP - workflowApp == == APP == Processing order 0c332155-1e02-453a-a333-28cfc7777642...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Returning 1 action(s)
== APP - workflowApp == == APP == Received "Activity Request" work item
== APP - workflowApp == == APP == Received order 0c332155-1e02-453a-a333-28cfc7777642 for 10 item1 at a total cost of 100
== APP - workflowApp == == APP == Activity notifyActivity completed with output undefined (0 chars)
== APP - workflowApp == == APP == Received "Orchestrator Request" work item with instance id '0c332155-1e02-453a-a333-28cfc7777642'
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Rebuilding local state with 3 history event...
== APP - workflowApp == == APP == Processing order 0c332155-1e02-453a-a333-28cfc7777642...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Returning 1 action(s)
== APP - workflowApp == == APP == Received "Activity Request" work item
== APP - workflowApp == == APP == Reserving inventory for 0c332155-1e02-453a-a333-28cfc7777642 of 10 item1
== APP - workflowApp == == APP == 2024-02-16T03:15:59.498Z INFO [HTTPClient, HTTPClient] Sidecar Started
== APP - workflowApp == == APP == There are 100 item1 in stock
== APP - workflowApp == == APP == Activity reserveInventoryActivity completed with output {"success":true,"inventoryItem":{"perItemCost":100,"quantity":100,"itemName":"item1"}} (86 chars)
== APP - workflowApp == == APP == Received "Orchestrator Request" work item with instance id '0c332155-1e02-453a-a333-28cfc7777642'
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Rebuilding local state with 6 history event...
== APP - workflowApp == == APP == Processing order 0c332155-1e02-453a-a333-28cfc7777642...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Returning 1 action(s)
== APP - workflowApp == == APP == Received "Activity Request" work item
== APP - workflowApp == == APP == Processing payment for order item1
== APP - workflowApp == == APP == Payment of 100 for 10 item1 processed successfully
== APP - workflowApp == == APP == Activity processPaymentActivity completed with output true (4 chars)
== APP - workflowApp == == APP == Received "Orchestrator Request" work item with instance id '0c332155-1e02-453a-a333-28cfc7777642'
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Rebuilding local state with 9 history event...
== APP - workflowApp == == APP == Processing order 0c332155-1e02-453a-a333-28cfc7777642...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Returning 1 action(s)
== APP - workflowApp == == APP == Received "Activity Request" work item
== APP - workflowApp == == APP == Updating inventory for 0c332155-1e02-453a-a333-28cfc7777642 of 10 item1
== APP - workflowApp == == APP == Inventory updated for 0c332155-1e02-453a-a333-28cfc7777642, there are now 90 item1 in stock
== APP - workflowApp == == APP == Activity updateInventoryActivity completed with output {"success":true,"inventoryItem":{"perItemCost":100,"quantity":90,"itemName":"item1"}} (85 chars)
== APP - workflowApp == == APP == Received "Orchestrator Request" work item with instance id '0c332155-1e02-453a-a333-28cfc7777642'
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Rebuilding local state with 12 history event...
== APP - workflowApp == == APP == Processing order 0c332155-1e02-453a-a333-28cfc7777642...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Returning 1 action(s)
== APP - workflowApp == == APP == Received "Activity Request" work item
== APP - workflowApp == == APP == order 0c332155-1e02-453a-a333-28cfc7777642 processed successfully!
== APP - workflowApp == == APP == Activity notifyActivity completed with output undefined (0 chars)
== APP - workflowApp == == APP == Received "Orchestrator Request" work item with instance id '0c332155-1e02-453a-a333-28cfc7777642'
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Rebuilding local state with 15 history event...
== APP - workflowApp == == APP == Processing order 0c332155-1e02-453a-a333-28cfc7777642...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - workflowApp == == APP == Order 0c332155-1e02-453a-a333-28cfc7777642 processed successfully!
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Orchestration completed with status COMPLETED
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Returning 1 action(s)
== APP - workflowApp == time="2024-02-15T21:15:59.5589687-06:00" level=info msg="0c332155-1e02-453a-a333-28cfc7777642: 'orderProcessingWorkflow' completed with a COMPLETED status." app_id=activity-sequence-workflow instance=kaibocai-devbox scope=wfengine.backend type=log ver=1.12.4
== APP - workflowApp == == APP == Instance 0c332155-1e02-453a-a333-28cfc7777642 completed
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

When you ran `dapr run --app-id activity-sequence-workflow --app-protocol grpc --dapr-grpc-port 50001 --components-path ../../components npm run start:order-process`

1. A unique order ID for the workflow is generated (in the above example, `0c332155-1e02-453a-a333-28cfc7777642`) and the workflow is scheduled.
2. The `notifyActivity` workflow activity sends a notification saying an order for 10 cars has been received.
3. The `reserveInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock.
4. Your workflow starts and notifies you of its status.
5. The `requestApprovalActivity` workflow activity requests approval for order `0c332155-1e02-453a-a333-28cfc7777642`
6. The `processPaymentActivity` workflow activity begins processing payment for order `0c332155-1e02-453a-a333-28cfc7777642` and confirms if successful.
7. The `updateInventoryActivity` workflow activity updates the inventory with the current available cars after the order has been processed.
8. The `notifyActivity` workflow activity sends a notification saying that order `0c332155-1e02-453a-a333-28cfc7777642` has completed and processed.
9. The workflow terminates as completed and processed.

