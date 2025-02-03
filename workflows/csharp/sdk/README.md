# Dapr workflows

In this quickstart, you'll create a simple console application to demonstrate Dapr's workflow programming model and the workflow management API. The console app starts and manages the lifecycle of a workflow that stores and retrieves data in a state store.

This quickstart includes one project:

- .NET console app `order-processor` 

The quickstart contains 1 workflow to simulate purchasing items from a store, and 4 unique activities within the workflow. These 4 activities are as follows:

- NotifyActivity: This activity utilizes a logger to print out messages throughout the workflow. These messages notify the user when there is insufficient inventory, their payment couldn't be processed, and more.
- ProcessPaymentActivity: This activity is responsible for processing and authorizing the payment.
- ReserveInventoryActivity: This activity checks the state store to ensure that there is enough inventory present for purchase.
- UpdateInventoryActivity: This activity removes the requested items from the state store and updates the store with the new remaining inventory value.

### Run the order processor workflow

1. Open a new terminal window and navigate to `order-processor` directory: 

<!-- STEP
name: Install Dotnet dependencies
-->

```bash
cd ./order-processor
dotnet restore
dotnet build
```

<!-- END_STEP -->
2. Run the console app with Dapr. Note that you may need to run `cd ..` to move the working directory up one to 
'/workflows/csharp/sdk': 

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - "== APP - order-processor ==       There are: 10 Cars available for purchase"
  - "== APP - order-processor == Workflow Status: Completed"
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
== APP - order-processor == Starting workflow 898fd553 purchasing 10 Cars

== APP - order-processor == info: Microsoft.DurableTask.Client.Grpc.GrpcDurableTaskClient[42]
== APP - order-processor == Your workflow has started. Here is the status of the workflow: Running
== APP - order-processor == info: WorkflowConsoleApp.Activities.NotifyActivity[1985924262]
== APP - order-processor == info: WorkflowConsoleApp.Activities.NotifyActivity[1985924262]
== APP - order-processor ==       Presenting notification Notification { Message = Received order 898fd553 for 10 Cars at $15000 }
== APP - order-processor == info: Microsoft.DurableTask.Client.Grpc.GrpcDurableTaskClient[43]
== APP - order-processor ==       Waiting for instance '898fd553' to complete, fail, or terminate.
== APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[2013970020]
== APP - order-processor ==       Received request ID '898fd553' for 10 Cars at $15000
== APP - order-processor == info: WorkflowConsoleApp.Activities.ReserveInventoryActivity[1988035937]
== APP - order-processor ==       Reserving inventory for order request ID '898fd553' of 10 Cars
== APP - order-processor == info: WorkflowConsoleApp.Activities.ReserveInventoryActivity[1130866279]
== APP - order-processor ==       There are: 10 Cars available for purchase
== APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[1162731597]
== APP - order-processor ==       Checked inventory for request ID 'InventoryRequest { RequestId = 898fd553, ItemName = Cars, Quantity = 10 }'
== APP - order-processor == info: WorkflowConsoleApp.Activities.ProcessPaymentActivity[340284070]
== APP - order-processor ==       Processing payment: request ID '898fd553' for 10 Cars at $15000
== APP - order-processor == info: WorkflowConsoleApp.Activities.ProcessPaymentActivity[1851315765]
== APP - order-processor ==       Payment for request ID '898fd553' processed successfully
== APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[340284070]
== APP - order-processor ==       Processed payment request as there's sufficient inventory to proceed: PaymentRequest { RequestId = 898fd553, ItemBeingPurchased = Cars, Amount = 10, Currency = 15000 }
== APP - order-processor == info: WorkflowConsoleApp.Activities.UpdateInventoryActivity[2144991393]
== APP - order-processor ==       Checking inventory for request ID '898fd553' for 10 Cars
== APP - order-processor == info: WorkflowConsoleApp.Activities.UpdateInventoryActivity[1901852920]
== APP - order-processor ==       There are now 90 Cars left in stock
== APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[96138418]
== APP - order-processor ==       Updating available inventory for PaymentRequest { RequestId = 898fd553, ItemBeingPurchased = Cars, Amount = 10, Currency = 15000 }
== APP - order-processor == info: WorkflowConsoleApp.Activities.NotifyActivity[1985924262]
== APP - order-processor ==       Presenting notification Notification { Message = Order 898fd553 has completed! }
== APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[510392223]
== APP - order-processor ==       Order 898fd553 has completed
== APP - order-processor == Workflow Status: Completed
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

When you ran `dapr run --app-id order-processor dotnet run`

1. A unique order ID for the workflow is generated (in the above example, `898fd553`) and the workflow is scheduled.
2. The `NotifyActivity` workflow activity sends a notification saying an order for 10 cars has been received.
3. The `ReserveInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock.
4. Your workflow starts and notifies you of its status.
5. The `ProcessPaymentActivity` workflow activity begins processing payment for order `898fd553` and confirms if successful.
6. The `UpdateInventoryActivity` workflow activity updates the inventory with the current available cars after the order has been processed.
7. The `NotifyActivity` workflow activity sends a notification saying that order `898fd553` has completed.
8. The workflow terminates as completed.

