# Dapr workflows

In this quickstart, you'll create a simple console application to demonstrate Dapr's workflow programming model and the workflow management API. The console app starts and manages the lifecycle of a workflow that stores and retrieves data in a state store.

This quickstart includes one project:

- python console app `order-processor` 

The quickstart contains 1 workflow order_processing_workflow to simulate purchasing items from a store, and 5 unique activities within the workflow. These 5 activities are as follows:

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
```

<!-- END_STEP -->
2. Run the console app with Dapr: 
<!-- STEP
name: Running this example
expected_stdout_lines:
  - "There are now 89 cars left in stock"
  - "Workflow completed! Result: COMPLETED"
output_match_mode: substring
background: true
timeout_seconds: 30
sleep: 15
-->

```sh
cd ./order-processor
dapr run --app-id order-processor --app-protocol grpc --dapr-grpc-port 50001 --components-path ../../../components/ --placement-host-address localhost:50005 -- python3 app.py cars 11 y exit
```

<!-- END_STEP -->

3. Expected output

```
==========Begin the purchase of item:==========
To restock items, type 'restock'.
To exit workflow console app, type 'exit'.
Enter the name of one of the following items to order: paperclip, cars, computers: cars
How many cars would you like to purchase? 11
Starting order workflow, purchasing 11 of cars
INFO:NotifyActivity:Received order b903d749cd814e099f06ebf4a56a2f90 for 11 cars at $165000 !
INFO:VerifyInventoryActivity:Verifying inventory for order b903d749cd814e099f06ebf4a56a2f90 of 11 cars
INFO:VerifyInventoryActivity:There are 100 Cars available for purchase
INFO:RequestApprovalActivity:Requesting approval for payment of 165000 USD for 11 cars
(ID = b903d749cd814e099f06ebf4a56a2f90) requires approval. Approve? [Y/N] y
INFO:NotifyActivity:Payment for order b903d749cd814e099f06ebf4a56a2f90 has been approved!
INFO:ProcessPaymentActivity:Processing payment: b903d749cd814e099f06ebf4a56a2f90 for 11 cars at 165000 USD
INFO:ProcessPaymentActivity:Payment for request ID b903d749cd814e099f06ebf4a56a2f90 processed successfully
INFO:UpdateInventoryActivity:Checking inventory for order b903d749cd814e099f06ebf4a56a2f90 for 11 cars
INFO:UpdateInventoryActivity:There are now 89 cars left in stock
INFO:NotifyActivity:Order b903d749cd814e099f06ebf4a56a2f90 has completed!
Workflow completed! Result: COMPLETED
  Purchase of item is  COMPLETED
```
