# Dapr workflows

In this quickstart, you'll create a simple console application to demonstrate Dapr's workflow programming model and the workflow client. The console app 
starts and manages an order processing workflow.
The workflow management API provided by the Dapr client can also be used interchangeably with minor adjustments

This quickstart includes one project:

- Go app `order-processor` 

The quickstart contains 1 workflow (OrderProcessingWorkflow) which simulates purchasing items from a store, and 5 unique activities within the workflow. These 5 
activities are as follows:

- NotifyActivity: This activity utilizes a logger to print out messages throughout the workflow. These messages notify the user when there is insufficient 
inventory, their payment couldn't be processed, and more.
- VerifyInventoryActivity: This activity checks the state store to ensure that there is enough inventory present for purchase.
- RequestApprovalActivity: This activity seeks approval from a manager, if payment is greater than 5000 USD.
- ProcessPaymentActivity: This activity is responsible for processing and authorizing the payment.
- UpdateInventoryActivity: This activity removes the requested items from the state store and updates the store with the new remaining inventory value.

### Run the order processor workflow

The app starts one order for 2 cars at 5000 each. The total is 10000, which is over 5000, so the workflow waits for an approval. In these steps you stop the app while it waits, start it again, and then approve the order.

1. Open a new terminal window in this quickstart directory.
2. Set an order ID. The app uses it as the workflow instance ID.

    Linux and macOS:

    ```sh
    export ORDER_ID=order-$(date +%Y%m%d-%H%M%S)
    ```

    Windows (PowerShell):

    ```powershell
    $env:ORDER_ID = "order-$(Get-Date -Format yyyyMMdd-HHmmss)"
    ```

3. Run the console app with Dapr:

<!-- STEP
name: Run the order processor
expected_stdout_lines:
  - "Order ID: order-validate"
  - "Started order order-validate."
  - "Approval requested for order order-validate. Waiting for approval."
  - "Workflow completed: COMPLETED"
output_match_mode: substring
env:
  ORDER_ID: order-validate
background: true
sleep: 40
timeout_seconds: 120
-->

```sh
dapr run -f .
```

<!-- END_STEP -->

    The log shows the order ID, `Started order <id>.`, the steps before the approval, and then the approval request:

    ```
    Order ID: order-20261024-101500
    adding base stock item: paperclip
    adding base stock item: cars
    adding base stock item: computers
    Started order order-20261024-101500.
    NotifyActivity: Received order order-20261024-101500 for 2 cars - $10000
    VerifyInventoryActivity: Verifying inventory for order order-20261024-101500 of 2 cars
    VerifyInventoryActivity: There are 10 cars available for purchase
    Approval requested for order order-20261024-101500. Waiting for approval.
    ```

4. Stop the app with CTRL+C. The order is not finished. Its state is in the state store.
5. Start the app again in the same terminal. `ORDER_ID` is still set.

    ```sh
    dapr run -f .
    ```

    The log shows that the order exists:

    ```
    Order ID: order-20261024-101500
    Order order-20261024-101500 is already running. Waiting for it to finish.
    ```

    The steps before the approval do not run again.

6. Open a second terminal and approve the order. Use the order ID that the app printed.

<!-- STEP
name: Approve the order
expected_stdout_lines:
  - "raised event"
output_match_mode: substring
timeout_seconds: 30
-->

```sh
dapr workflow raise-event order-validate/ApprovalEvent --app-id order-processor --input '{"approved": true}'
```

<!-- END_STEP -->

    In the first terminal, the workflow continues with the payment and the inventory update. The app ends:

    ```
    NotifyActivity: Payment for order order-20261024-101500 has been approved!
    ProcessPaymentActivity: order-20261024-101500 for 2 - cars (10000USD)
    UpdateInventoryActivity: Checking Inventory for order order-20261024-101500 for 2 * cars
    UpdateInventoryActivity: There are now 8 cars left in stock
    NotifyActivity: Order order-20261024-101500 has completed!
    Workflow completed: COMPLETED
    ```

In the second run, the `Received order`, the inventory check and the approval request lines did not appear again. The workflow continued from its history. A step that was running at the moment of the stop can run again. If you wait longer than 10 minutes for the approval, the workflow cancels the order.

### Run without Docker

By default, the quickstart uses Redis in Docker as the workflow state store, and the Dapr Placement and Scheduler services in Docker. You can run the quickstart without Docker and Redis and instead run the Dapr binaries as processes, and use an SQLite file to keep the workflow state.

Use this option when Docker is not available or not allowed, for example on a locked-down laptop, in a CI job, or in a dev container without Docker. It also starts faster, because it has fewer moving parts.

The commands are for Linux and macOS, and for Windows (PowerShell).

#### Prerequisites without Docker and Redis

- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/). You do not need `dapr init` with Docker. Step 1 installs the binaries.
- [Go](https://go.dev/doc/install)
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

4. Open a third terminal in the same directory and run the app with the run file `dapr-sqlite.yaml`:

    ```sh
    dapr run -f dapr-sqlite.yaml
    ```

    Then follow steps 2 to 6 above, with `dapr run -f dapr-sqlite.yaml` as the run command. Set `ORDER_ID` in this terminal before you start the app.

`dapr-sqlite.yaml` is the same as `dapr.yaml`, but its `resourcesPath` points to the [`components-sqlite`](../../components-sqlite/) folder. That folder has a SQLite state store with `actorStateStore` set to `"true"`. The expected output is the same as in the steps above.

To start again with no workflow state, stop all processes and delete the `scheduler-data` folder and the `workflows.db` file in the `order-processor` folder.

### View workflow output with Zipkin

For a more detailed view of the workflow activities (duration, progress etc.), try using Zipkin.

1. View Traces in Zipkin UI - In your browser go to http://localhost:9411 to view the workflow trace spans in the Zipkin web UI. The order-processor workflow 
should be viewable with the following output in the Zipkin web UI. Note: the [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) docker container is 
launched on running `dapr init`.

<img src="img/workflow-trace-spans-zipkin.png">

### What happened? 

When you ran the above commands:

1. An OrderPayload is made containing two cars.
2. The app reads the order ID from `ORDER_ID` (for example `order-20261024-101500`). It uses the ID as the workflow instance ID. If the instance does not exist, the app schedules the workflow. If it exists and is not finished, the app waits for it.
3. The app writes the starting inventory to the state store only when the inventory is not there yet. A restart does not reset the stock.
4. The `NotifyActivity` workflow activity sends a notification saying an order for 2 cars has been received.
5. The `VerifyInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock.
6. The total cost of the order is 10000, so the workflow calls the `RequestApprovalActivity` activity and waits up to 10 minutes for the `ApprovalEvent` event.
7. When you raise `ApprovalEvent` with `{"approved": true}`, the `ProcessPaymentActivity` workflow activity processes the payment.
8. The `UpdateInventoryActivity` workflow activity updates the inventory with the current available cars after the order has been processed.
9. The `NotifyActivity` workflow activity sends a notification saying that the order has completed.
10. The workflow terminates as completed and the OrderResult is set to processed.

> **Note:** If you set `approved` to `false`, the workflow sends a rejection notification and ends without a payment. To skip the approval, change the order in `main.go` to 1 car (total 5000).
