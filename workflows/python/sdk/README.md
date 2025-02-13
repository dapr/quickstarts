# Dapr workflows

In this quickstart, you'll create a simple console application to demonstrate Dapr's workflow programming model and the workflow management API. The console app starts and manages an order processing workflow.

This quickstart includes one project:

- Python console app `order-processor` 

The quickstart contains 1 workflow (order_processing_workflow) which simulates purchasing items from a store, and 5 unique activities within the workflow. These 5 activities are as follows:

- notify_activity: This activity utilizes a logger to print out messages throughout the workflow. These messages notify the user when there is insufficient inventory, their payment couldn't be processed, and more.
- process_payment_activity: This activity is responsible for processing and authorizing the payment.
- verify_inventory_activity: This activity checks the state store to ensure that there is enough inventory present for purchase.
- update_inventory_activity: This activity removes the requested items from the state store and updates the store with the new remaining inventory value.
- requst_approval_activity: This activity seeks approval from Manager, if payment is greater than 50000 USD.

### Run the order processor workflow

1. Open a new terminal window and navigate to `order-processor` directory: 

<!-- STEP
name: Install requirements
-->

```sh
cd ./order-processor
pip3 install -r requirements.txt
cd ..
```

<!-- END_STEP -->
2. Run the console app with Dapr: 
<!-- STEP
name: Running this example
expected_stdout_lines:
  - "== APP - order-processor == INFO:UpdateInventoryActivity:There are now 9 cars left in stock"
  - "== APP - order-processor == Workflow completed! Result: WorkflowStatus.COMPLETED"
output_match_mode: substring
background: true
timeout_seconds: 120
sleep: 15
-->

```sh
dapr run -f .
```

3. Expected output

```
== APP - order-processor == *** Welcome to the Dapr Workflow console app sample!
== APP - order-processor == *** Using this app, you can place orders that start workflows.
== APP - order-processor == 2025-02-13 11:44:11.357 durabletask-worker INFO: Starting gRPC worker that connects to dns:127.0.0.1:38891
== APP - order-processor == 2025-02-13 11:44:11.361 durabletask-worker INFO: Successfully connected to dns:127.0.0.1:38891. Waiting for work items...
== APP - order-processor == INFO:NotifyActivity:Received order 6830cb00174544a0b062ba818e14fddc for 1 cars at $5000 !
== APP - order-processor == 2025-02-13 11:44:14.157 durabletask-worker INFO: 6830cb00174544a0b062ba818e14fddc: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:VerifyInventoryActivity:Verifying inventory for order 6830cb00174544a0b062ba818e14fddc of 1 cars
== APP - order-processor == INFO:VerifyInventoryActivity:There are 10 Cars available for purchase
== APP - order-processor == 2025-02-13 11:44:14.171 durabletask-worker INFO: 6830cb00174544a0b062ba818e14fddc: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:ProcessPaymentActivity:Processing payment: 6830cb00174544a0b062ba818e14fddc for 1 cars at 5000 USD
== APP - order-processor == INFO:ProcessPaymentActivity:Payment for request ID 6830cb00174544a0b062ba818e14fddc processed successfully
== APP - order-processor == 2025-02-13 11:44:14.177 durabletask-worker INFO: 6830cb00174544a0b062ba818e14fddc: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:UpdateInventoryActivity:Checking inventory for order 6830cb00174544a0b062ba818e14fddc for 1 cars
== APP - order-processor == INFO:UpdateInventoryActivity:There are now 9 cars left in stock
== APP - order-processor == 2025-02-13 11:44:14.189 durabletask-worker INFO: 6830cb00174544a0b062ba818e14fddc: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:NotifyActivity:Order 6830cb00174544a0b062ba818e14fddc has completed!
== APP - order-processor == 2025-02-13 11:44:14.195 durabletask-worker INFO: 6830cb00174544a0b062ba818e14fddc: Orchestration completed with status: COMPLETED
== APP - order-processor == item: InventoryItem(item_name=Paperclip, per_item_cost=5, quantity=100)
== APP - order-processor == item: InventoryItem(item_name=Cars, per_item_cost=5000, quantity=10)
== APP - order-processor == item: InventoryItem(item_name=Computers, per_item_cost=500, quantity=100)
== APP - order-processor == ==========Begin the purchase of item:==========
== APP - order-processor == Starting order workflow, purchasing 1 of cars
== APP - order-processor == 2025-02-13 11:44:16.363 durabletask-client INFO: Starting new 'order_processing_workflow' instance with ID = 'fc8a507e4a2246d2917d3ad4e3111240'.
== APP - order-processor == 2025-02-13 11:44:16.366 durabletask-client INFO: Waiting 30s for instance 'fc8a507e4a2246d2917d3ad4e3111240' to complete.
== APP - order-processor == 2025-02-13 11:44:16.366 durabletask-worker INFO: fc8a507e4a2246d2917d3ad4e3111240: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:NotifyActivity:Received order fc8a507e4a2246d2917d3ad4e3111240 for 1 cars at $5000 !
== APP - order-processor == 2025-02-13 11:44:16.373 durabletask-worker INFO: fc8a507e4a2246d2917d3ad4e3111240: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:VerifyInventoryActivity:Verifying inventory for order fc8a507e4a2246d2917d3ad4e3111240 of 1 cars
== APP - order-processor == INFO:VerifyInventoryActivity:There are 10 Cars available for purchase
== APP - order-processor == 2025-02-13 11:44:16.383 durabletask-worker INFO: fc8a507e4a2246d2917d3ad4e3111240: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:ProcessPaymentActivity:Processing payment: fc8a507e4a2246d2917d3ad4e3111240 for 1 cars at 5000 USD
== APP - order-processor == INFO:ProcessPaymentActivity:Payment for request ID fc8a507e4a2246d2917d3ad4e3111240 processed successfully
== APP - order-processor == 2025-02-13 11:44:16.390 durabletask-worker INFO: fc8a507e4a2246d2917d3ad4e3111240: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:UpdateInventoryActivity:Checking inventory for order fc8a507e4a2246d2917d3ad4e3111240 for 1 cars
== APP - order-processor == INFO:UpdateInventoryActivity:There are now 9 cars left in stock
== APP - order-processor == 2025-02-13 11:44:16.403 durabletask-worker INFO: fc8a507e4a2246d2917d3ad4e3111240: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:NotifyActivity:Order fc8a507e4a2246d2917d3ad4e3111240 has completed!
== APP - order-processor == 2025-02-13 11:44:16.411 durabletask-worker INFO: fc8a507e4a2246d2917d3ad4e3111240: Orchestration completed with status: COMPLETED
== APP - order-processor == 2025-02-13 11:44:16.425 durabletask-client INFO: Instance 'fc8a507e4a2246d2917d3ad4e3111240' completed.
== APP - order-processor == 2025-02-13 11:44:16.425 durabletask-worker INFO: Stopping gRPC worker...
== APP - order-processor == 2025-02-13 11:44:16.426 durabletask-worker INFO: Disconnected from dns:127.0.0.1:38891
== APP - order-processor == 2025-02-13 11:44:16.426 durabletask-worker INFO: No longer listening for work items
== APP - order-processor == 2025-02-13 11:44:16.426 durabletask-worker INFO: Worker shutdown completed
== APP - order-processor == Workflow completed! Result: {"processed": true, "__durabletask_autoobject__": true}
```

4. Stop Dapr workflow with CTRL-C or:
<!-- END_STEP -->

```sh
dapr stop -f .
```


### View workflow output with Zipkin

For a more detailed view of the workflow activities (duration, progress etc.), try using Zipkin.

1. View Traces in Zipkin UI - In your browser go to http://localhost:9411 to view the workflow trace spans in the Zipkin web UI. The order-processor workflow should be viewable with the following output in the Zipkin web UI. Note: the [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) docker container is launched on running `dapr init`. 

**<ZIPKIN TRACE FOR PYTHON CONSOLE APP>**

### What happened? 

When you ran `dapr run -f .`

1. An OrderPayload is made containing one car.
2. A unique order ID for the workflow is generated (in the above example, `fc8a507e4a2246d2917d3ad4e3111240`) and the workflow is scheduled.
3. The `notify_activity` workflow activity sends a notification saying an order for one car has been received.
4. The `verify_inventory_activity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock. The inventory is sufficient so the workflow continues.
5. The total cost of the order is 5000, so the workflow will not call the `request_approval_activity` activity.
6. The `process_payment_activity` workflow activity begins processing payment for order `fc8a507e4a2246d2917d3ad4e3111240` and confirms if successful.
7. The `update_inventory_activity` workflow activity updates the inventory with the current available cars after the order has been processed.
8. The `notify_activity` workflow activity sends a notification saying that order `fc8a507e4a2246d2917d3ad4e3111240` has completed.
9. The workflow terminates as completed and the OrderResult is set to processed.
