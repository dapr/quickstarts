# Dapr state management

In this quickstart, you'll create a microservice to demonstrate Dapr's state management API. The service generates messages to store data in a state store. See [Why state management](https://docs.dapr.io/developing-applications/building-blocks/state-management/) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/state-management/) link for more information about Dapr and State Management.

> **Note:** This example uses the `Dapr.StateManagement` SDK and its source-generated state store implementation. If you are looking for the example using only HTTP [click here](../http).

This quickstart includes one service: Dotnet client service `order-processor`

## Run all apps with multi-app run template file

This section shows how to run applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.

1. Open a new terminal window and run  `order-processor` using the multi app run template defined in [dapr.yaml](./dapr.yaml):

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - 'Getting Order: {"orderId":1}'
  - 'Getting Order: {"orderId":2}'  
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 100
-->

```bash
dapr run -f .
```

2. Stop and clean up application processes

```bash
dapr stop -f .
```
<!-- END_STEP -->

## Inspect the state store with the Dapr Dev Dashboard

The free [Dapr Dev Dashboard](https://docs.dapr.io/developing-applications/local-development/dapr-dev-dashboard/) lists the records in the `statestore` component, so you can inspect the state the order processor writes without adding code.

This app saves each order and deletes it again in the same loop iteration, so by default no records are left to look at. To keep them in the state store, comment out the delete call in `order-processor/Program.cs`:

```csharp
// Delete state from the state store
// await stateStore.DeleteStateAsync(order.OrderId.ToString());
// Console.WriteLine("Deleting Order: " + order);
```

Then run the app again, and:

1. [Install the dashboard](https://github.com/diagridio/dev-dashboard#installation-instructions), then start it in a separate terminal while the app is running:

    ```sh
    diagrid-dev-dashboard
    ```

    This opens http://localhost:9090 in your browser.

2. Go to the **State** page. Dapr prefixes state keys with the app id, so the orders appear as `order-processor||1`, `order-processor||2`, and so on.
3. Expand a row to see the full value, and use the **Decode base64** toggle if the value is encoded. You can also add and delete records from this page.

Restore the delete call when you are done, so the app matches the output documented above.

The Dev Dashboard is a local development tool. It is not intended for Kubernetes, production, or any shared environment.

## Run a single app at a time with Dapr (Optional)

An alternative to running all or multiple applications at once is to run single apps one-at-a-time using multiple `dapr run .. -- dotnet run` commands.  This next section covers how to do this.

1. Run the Dotnet service app with Dapr:

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - 'Getting Order: {"orderId":1}'
  - 'Getting Order: {"orderId":2}'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->

```bash
cd ./order-processor
dapr run --app-id order-processor --resources-path ../../../resources/ -- dotnet run
```
<!-- END_STEP -->

The Terminal console output should look similar to this:

```text
You're up and running! Both Dapr and your app logs will appear here.

Saving Order: Order { OrderId = 1 }
Getting Order: {"orderId":1}
Deleting Order: Order { OrderId = 1 }
Saving Order: Order { OrderId = 2 }
Getting Order: {"orderId":2}
Deleting Order: Order { OrderId = 2 }
Saving Order: Order { OrderId = 3 }
Getting Order: {"orderId":3}
Deleting Order: Order { OrderId = 3 }
```

2. Stop and clean up application processes

```bash
dapr stop --app-id order-processor
```
