# Combined Workflow Patterns

This tutorial demonstrates how several workflow patterns can be combined in a single, more realistic, workflow. Some of the workflow activities are using other Dapr APIs, such as state management, service invocation, and Pub/Sub.

## Inspect the code

The demo consist of two applications:

- `WorkflowApp` is the main application that orchestrates an order process in the `OrderWorkflow`.
- `ShippingApp` is a supporting service that is being called by the `OrderWorkflow`.

The `OrderWorkflow` combines task chaining, fan-out/fan-in, and waiting for external event patterns. The workflow contains a number of activities for order processing including checking inventory, register shipment, process payment and more with a final order status being returned with the results of the order. It uses compensating logic in case the shipment fails to get registered and the customer needs to be reimbursed for the payment.

```mermaid
graph LR
   SW((Start
   Workflow))
   EW((End
    Workflow))
   subgraph OrderWorkflow
   direction LR
    CHKI[Check inventory]
    CHKD[Check shipping
    destination]
    IF1{Success?}
    PAY[Process
    payment]
    UPD[Update
    inventory]
    REG[Register
    shipment]
    WAIT[Wait for
    confirmation]
    IF2{Success?}
    RI[Reimburse
    customer]
   end
   subgraph Shipping
    direction LR
    REG2[registerShipment]
    CHKD2[checkDestination]
   end
    SW --> CHKI
    SW --> CHKD <--> CHKD2
    CHKI --> IF1
    CHKD --> IF1
    IF1 --> PAY
    PAY --> UPD
    UPD --> REG -.->|pub/sub| REG2
    REG2 -.->|pub/sub| WAIT
    REG --> WAIT
    WAIT --> IF2
    IF2 -->|Yes| EW
    IF2 -->|No| RI
    RI --> EW
```

## Run the tutorial

1. Use a terminal to navigate to the `tutorials/workflow/csharp/combined-patterns` folder.
2. Build the projects using the .NET CLI.

    ```bash
    dotnet build ./WorkflowApp/
    dotnet build ./ShippingApp/
    ```

3. Use the Dapr CLI to run the Dapr Multi-App run file

    <!-- STEP
    name: Run multi app run template
    expected_stdout_lines:
    - 'Started Dapr with app id "order-workflow"'
    - 'Started Dapr with app id "shipping"'
    expected_stderr_lines:
    working_dir: .
    output_match_mode: substring
    background: true
    sleep: 15
    timeout_seconds: 30
    -->
    ```bash
    dapr run -f .
    ```
    <!-- END_STEP -->

4. Use the POST request in the [`order-workflow.http`](./order-workflow.http) file to start the workflow.

    The input for the workflow is an `Order` object:

    ```json
    {
        "id": "{{orderId}}",
        "orderItem" : {
            "productId": "RBD001",
            "productName": "Rubber Duck",
            "quantity": 10,
            "totalPrice": 15.00
        },
        "customerInfo" : {
            "id" : "Customer1",
            "country" : "The Netherlands"
        }
    }
    ```

5. Use the GET request in the [`order-workflow.http`](./order-workflow.http) file to get the status of the workflow.

    The expected serialized output of the workflow is:

    ```txt
    {\"IsSuccess\":true,\"Message\":\"Order 2a28fd28-15c1-4594-93ec-eb088c6be4a3 processed successfully.\"}"
    ```

    *The Order ID is generated when making the request and is different each time.*

6. Stop the Dapr Multi-App run process by pressing `Ctrl+C`.
