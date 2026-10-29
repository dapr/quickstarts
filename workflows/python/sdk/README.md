# Dapr workflows

In this quickstart, you'll create a simple console application to demonstrate Dapr's workflow programming model and the workflow management API. The console app starts and manages an order processing workflow.

This quickstart includes one project:

- Python console app `order-processor` 

The quickstart contains 1 workflow (order_processing_workflow) which simulates purchasing items from a store, and 5 unique activities within the workflow. These 5 activities are as follows:

- notify_activity: This activity utilizes a logger to print out messages throughout the workflow. These messages notify the user when there is insufficient inventory, their payment couldn't be processed, and more.
- process_payment_activity: This activity is responsible for processing and authorizing the payment.
- verify_inventory_activity: This activity checks the state store to ensure that there is enough inventory present for purchase.
- update_inventory_activity: This activity removes the requested items from the state store and updates the store with the new remaining inventory value.
- request_approval_activity: This activity seeks approval from Manager, if payment is greater than 5000 USD.

### Run the order processor workflow

1. Open a new terminal window in this quickstart directory and install dependencies:

<!-- STEP
name: Install requirements
-->

```sh
uv sync
```

<!-- END_STEP -->
2. Run the console app with Dapr: 
<!-- STEP
name: Running this example
expected_stdout_lines:
  - "There are now 9 cars left in stock"
  - "Workflow completed! Result: {\"processed\": true"
output_match_mode: substring
background: true
timeout_seconds: 120
sleep: 15
-->

```sh
uv run dapr run -f .
```

<!-- END_STEP -->

3. Expected output. The order ID and the ports differ on each run:

```
*** Welcome to the Dapr Workflow console app sample!
*** Using this app, you can place orders that start workflows.
item: InventoryItem(item_name=Paperclip, per_item_cost=5, quantity=100)
item: InventoryItem(item_name=Cars, per_item_cost=5000, quantity=10)
item: InventoryItem(item_name=Computers, per_item_cost=500, quantity=100)
==========Begin the purchase of item:==========
Starting order workflow, purchasing 1 of cars
Received order 0a8c4d9b59094191bf77e111c38a5e55 for 1 cars at $5000 !
Verifying inventory for order 0a8c4d9b59094191bf77e111c38a5e55 of 1 cars
There are 10 Cars available for purchase
Processing payment: 0a8c4d9b59094191bf77e111c38a5e55 for 1 cars at 5000 USD
Payment for request ID 0a8c4d9b59094191bf77e111c38a5e55 processed successfully
Checking inventory for order 0a8c4d9b59094191bf77e111c38a5e55 for 1 cars
There are now 9 cars left in stock
Order 0a8c4d9b59094191bf77e111c38a5e55 has completed!
Workflow completed! Result: {"processed": true, "__durabletask_autoobject__": true}
```

4. Stop Dapr workflow with CTRL-C or:

```sh
dapr stop -f .
```

### Run without Docker

By default, the quickstart uses Redis in Docker as the workflow state store, and the Dapr Placement and Scheduler services in Docker. You can run the quickstart without Docker and Redis and instead run the Dapr binaries as processes, and use an SQLite file to keep the workflow state.

Use this option when Docker is not available or not allowed, for example on a locked-down laptop, in a CI job, or in a dev container without Docker. It also starts faster, because it has fewer moving parts.

The commands are for Linux and macOS, and for Windows (PowerShell).

#### Prerequisites without Docker and Redis

- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/). You do not need `dapr init` with Docker. Step 1 installs the binaries.
- [uv](https://docs.astral.sh/uv/getting-started/installation/)
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

4. Open a third terminal in the same directory, install the dependencies, and run the console app with the run file `dapr-sqlite.yaml`:

    ```sh
    uv sync
    uv run dapr run -f dapr-sqlite.yaml
    ```

`dapr-sqlite.yaml` is the same as `dapr.yaml`, but its `resourcesPath` points to the [`components-sqlite`](../../components-sqlite/) folder. That folder has a SQLite state store with `actorStateStore` set to `"true"`. The expected output is the same as in the steps above.

To start again with no workflow state, stop all processes and delete the `scheduler-data` folder and the `workflows.db` file in the `order-processor` folder.

### View workflow output with Zipkin

For a more detailed view of the workflow activities (duration, progress etc.), try using Zipkin.

1. View Traces in Zipkin UI - In your browser go to http://localhost:9411 to view the workflow trace spans in the Zipkin web UI. The order-processor workflow should be viewable with the following output in the Zipkin web UI. Note: the [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) docker container is launched on running `dapr init`. 

<img src="img/zipkin-trace-wf-order.png">

### What happened? 

When you ran `dapr run -f .`

1. An OrderPayload is made containing one car.
2. A unique order ID for the workflow is generated (in the above example, `0a8c4d9b59094191bf77e111c38a5e55`) and the workflow is scheduled.
3. The `notify_activity` workflow activity sends a notification saying an order for one car has been received.
4. The `verify_inventory_activity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock. The inventory is sufficient so the workflow continues.
5. The total cost of the order is 5000, so the workflow will not call the `request_approval_activity` activity.
6. The `process_payment_activity` workflow activity begins processing payment for order `0a8c4d9b59094191bf77e111c38a5e55` and confirms if successful.
7. The `update_inventory_activity` workflow activity updates the inventory with the current available cars after the order has been processed.
8. The `notify_activity` workflow activity sends a notification saying that order `0a8c4d9b59094191bf77e111c38a5e55` has completed.
9. The workflow terminates as completed and the OrderResult is set to processed.

> **Note:** This quickstart uses an OrderPayload of one car with a total cost of $5000. Since the total order cost is not over 5000, the workflow will not call the `request_approval_activity` activity nor wait for an approval event. Since the quickstart is a console application, it can't accept incoming events easily. If you want to test this scenario, convert the console app to a service and use the [raise event API](https://docs.dapr.io/reference/api/workflow_api/#raise-event-request) via HTTP/gRPC or via the Dapr Workflow client to send an event to the workflow instance.
