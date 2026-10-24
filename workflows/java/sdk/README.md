# Dapr workflows

In this quickstart, you'll run console application to demonstrate Dapr's workflow programming model and the workflow management API. The console app starts and manages the lifecycle of a workflow that stores and retrieves data in a state store.

This quickstart includes one project:

- Java console app `order-processor` 

The quickstart contains 1 workflow to simulate purchasing items from a store, and 5 unique activities within the workflow. These 5 activities are as follows:

- NotifyActivity: This activity utilizes a logger to print out messages throughout the workflow. These messages notify the user when there is insufficient inventory, their payment couldn't be processed, and more.
- VerifyInventoryActivity: This activity checks the state store to ensure that there is enough inventory present for purchase.
- RequestApprovalActivity: This activity requests approval for orders over a certain threshold.
- ProcessPaymentActivity: This activity is responsible for processing and authorizing the payment.
- UpdateInventoryActivity: This activity updates the state store with the new remaining inventory value.

### Run the order processor workflow

The app places one order for 2 cars at $5,000 each. The total is $10,000, so the workflow waits for your approval. You stop the app while it waits, start it again, and then approve the order. The workflow continues from where it stopped.

1. Set an order ID. The app uses it as the workflow instance ID. Use the same terminal for all the steps below.

    ```bash
    export ORDER_ID=order-$(date +%Y%m%d-%H%M%S)
    ```

    On Windows (PowerShell):

    ```powershell
    $env:ORDER_ID = "order-$(Get-Date -Format yyyyMMdd-HHmmss)"
    ```

2. Build the app, and then run it with Dapr:

<!-- STEP
name: Install Java dependencies
-->

```bash
cd ./order-processor
mvn clean install
cd ..
```

<!-- END_STEP -->

<!-- STEP
name: Run order-processor service
env:
  ORDER_ID: order-validate
expected_stdout_lines:
  - 'Order ID: order-validate'
  - 'Started order order-validate.'
  - 'Approval requested for order order-validate. Waiting for approval.'
  - 'there are now 8 cars left in stock'
  - 'Workflow completed: COMPLETED'
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 20
timeout_seconds: 120
-->

```bash
dapr run -f .
```

<!-- END_STEP -->

    The log shows the order ID, the start of the order, the activities before the approval, and then that the workflow waits for approval. The instance ID, the dates and the ports differ on each run:

    ```
    *** Welcome to the Dapr Workflow console app sample!
    *** Using this app, you can place orders that start workflows.
    Order ID: order-20261024-003700
    Start workflow runtime
    Started order order-20261024-003700.
    [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.NotifyActivity - Received Order: OrderPayload [itemName=cars, totalCost=10000, quantity=2]
    [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.VerifyInventoryActivity - Verifying inventory for order 'order-20261024-003700' of 2 cars
    [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.VerifyInventoryActivity - There are 10 cars available for purchase
    [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.VerifyInventoryActivity - Verified inventory for order 'order-20261024-003700' of 2 cars
    [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.RequestApprovalActivity - Requesting approval for order: order-20261024-003700
    Approval requested for order order-20261024-003700. Waiting for approval.
    ```

3. Stop the app with CTRL-C.

4. Start the app again in the same terminal. `ORDER_ID` is still set, so the app finds the order that is already running:

    ```bash
    dapr run -f .
    ```

    The log shows `Order order-20261024-003700 is already running. Waiting for it to finish.` The activities before the approval do not run again.

5. In a second terminal, approve the order. Use the order ID that the app printed:

<!-- STEP
name: Approve the order
expected_stdout_lines:
  - "raised event 'ApprovalEvent' successfully"
expected_stderr_lines:
output_match_mode: substring
-->

```bash
dapr workflow raise-event order-validate/ApprovalEvent --app-id order-processor --input '{"approved": true}'
```

<!-- END_STEP -->

    To reject the order, send `{"approved": false}`. If you send no answer in 10 minutes, the workflow cancels the order.

6. The first terminal shows the payment, the inventory update and the end of the workflow:

    ```
    [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.ProcessPaymentActivity - Processing payment: order-20261024-003700 for 2 cars at $10000
    [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.ProcessPaymentActivity - Payment for request ID 'order-20261024-003700' processed successfully
    [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.UpdateInventoryActivity - Updating inventory for order 'order-20261024-003700' of 2 cars
    [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.UpdateInventoryActivity - Updated inventory for order 'order-20261024-003700': there are now 8 cars left in stock
    there are now 8 cars left in stock
    [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.NotifyActivity - Order completed! : order-20261024-003700
    Workflow completed: COMPLETED
    ```

    The steps that finished before you stopped the app did not run again. The workflow continued from its history. Dapr kept the history while the app was off. A step that was running when you stopped the app can run again.

7. Stop Dapr workflow with CTRL-C or:

```sh
dapr stop -f .
```

### Run without Docker

By default, the quickstart uses Redis in Docker as the workflow state store, and the Dapr Placement and Scheduler services in Docker. You can run the quickstart without Docker and Redis and instead run the Dapr binaries as processes, and use an SQLite file to keep the workflow state.

Use this option when Docker is not available or not allowed, for example on a locked-down laptop, in a CI job, or in a dev container without Docker. It also starts faster, because it has fewer moving parts.

The commands are for Linux and macOS, and for Windows (PowerShell).

#### Prerequisites without Docker and Redis

- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/). You do not need `dapr init` with Docker. Step 1 installs the binaries.
- [JDK and Maven](https://maven.apache.org/install.html)
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

4. Open a third terminal in the same directory. Set an order ID, build the app, and run it with the run file `dapr-sqlite.yaml`:

    ```sh
    export ORDER_ID=order-$(date +%Y%m%d-%H%M%S)
    cd ./order-processor
    mvn clean install
    cd ..
    dapr run -f dapr-sqlite.yaml
    ```

    On Windows (PowerShell), set the order ID with `$env:ORDER_ID = "order-$(Get-Date -Format yyyyMMdd-HHmmss)"`.

5. Follow steps 3 to 6 of the section above. Stop the app with CTRL-C, start it again with `dapr run -f dapr-sqlite.yaml`, approve the order from a second terminal, and see the workflow finish. The log is the same as in the steps above.

`dapr-sqlite.yaml` is the same as `dapr.yaml`, but its `resourcesPath` points to the [`components-sqlite`](../../components-sqlite/) folder. That folder has a SQLite state store with `actorStateStore` set to `"true"`.

To start again with no workflow state, stop all processes and delete the `scheduler-data` folder and the `workflows.db` file in the `order-processor/target` folder.

### View workflow output with Zipkin

For a more detailed view of the workflow activities (duration, progress etc.), try using Zipkin.

1. Launch Zipkin container - The [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) docker container is launched on running `dapr init`. Check to make sure the container is running. If it's not, launch the Zipkin docker container with the following command.

```bash
docker run -d -p 9411:9411 openzipkin/zipkin
```

2. View Traces in Zipkin UI - In your browser go to http://localhost:9411 to view the workflow trace spans in the Zipkin web UI. The order-processor workflow should be viewable with the following output in the Zipkin web UI. 

<img src="img/workflow-trace-spans-zipkin.png">

### What happened?

When you ran `dapr run -f .`:

1. The app read the order ID from `ORDER_ID`. When `ORDER_ID` is not set, the app makes an ID from the date and the time.
2. The app looked for a workflow instance with that ID. It found none, so it scheduled `OrderProcessingWorkflow` for an order of 2 cars. The total cost is 10000.
3. The app wrote the inventory (10 cars) to the state store, because the inventory key was not there.
4. The `NotifyActivity` workflow activity sends a notification saying the app received an order for 2 cars.
5. The `VerifyInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock. The inventory is sufficient so the workflow continues.
6. The total cost of the order is over 5000, so the workflow calls the `RequestApprovalActivity` activity. The activity prints that it waits for approval. The workflow then waits for the external event `ApprovalEvent`, for up to 10 minutes.
7. When you started the app again, it found the instance with the same ID, and did not schedule a new one. It did not write the inventory again, because the inventory key was already there.
8. The `dapr workflow raise-event` command sent `ApprovalEvent` with `{"approved": true}`. The workflow continued from its history.
9. The `ProcessPaymentActivity` workflow activity processes the payment, and the `UpdateInventoryActivity` workflow activity updates the inventory with the current available cars (8).
10. The `NotifyActivity` workflow activity sends a notification saying that the order is complete. The workflow ends as completed and the app prints `Workflow completed: COMPLETED`.

If you start the app with the ID of an order that ended, the app prints the status of that order and exits.
