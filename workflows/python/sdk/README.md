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
  - "There are now 90 cars left in stock"
  - "Workflow completed! Result: Completed"
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
==========Begin the purchase of item:==========
Starting order workflow, purchasing 10 of cars
INFO:NotifyActivity:Received order b903d749cd814e099f06ebf4a56a2f90 for 10 cars at $150000 !
INFO:VerifyInventoryActivity:Verifying inventory for order b903d749cd814e099f06ebf4a56a2f90 of 10 cars
INFO:VerifyInventoryActivity:There are 100 Cars available for purchase
INFO:RequestApprovalActivity:Requesting approval for payment of 150000 USD for 10 cars
INFO:NotifyActivity:Payment for order b903d749cd814e099f06ebf4a56a2f90 has been approved!
INFO:ProcessPaymentActivity:Processing payment: b903d749cd814e099f06ebf4a56a2f90 for 10 cars at 150000 USD
INFO:ProcessPaymentActivity:Payment for request ID b903d749cd814e099f06ebf4a56a2f90 processed successfully
INFO:UpdateInventoryActivity:Checking inventory for order b903d749cd814e099f06ebf4a56a2f90 for 10 cars
INFO:UpdateInventoryActivity:There are now 90 cars left in stock
INFO:NotifyActivity:Order b903d749cd814e099f06ebf4a56a2f90 has completed!
Workflow completed! Result: Completed
  Purchase of item is  Completed
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

When you ran `dapr run --app-id order-processor --resources-path ../../../components/ -- python3 app.py`

1. First the user inputs an order for 10 cars into the concole app.
2. A unique order ID for the workflow is generated (in the above example, `b903d749cd814e099f06ebf4a56a2f90`) and the workflow is scheduled.
3. The `NotifyActivity` workflow activity sends a notification saying an order for 10 cars has been received.
4. The `VerifyInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock.
5. The `RequestApprovalActivity` workflow activity is triggered due to buisness logic for orders exceeding $50k and user is prompted to manually approve the purchase before continuing order. 
6. The workflow starts and notifies you of its status.
7. The `ProcessPaymentActivity` workflow activity begins processing payment for order `b903d749cd814e099f06ebf4a56a2f90` and confirms if successful.
8. The `UpdateInventoryActivity` workflow activity updates the inventory with the current available cars after the order has been processed.
9. The `NotifyActivity` workflow activity sends a notification saying that order `b903d749cd814e099f06ebf4a56a2f90` has completed.
10. The workflow terminates as completed.






