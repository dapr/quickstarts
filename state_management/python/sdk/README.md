# Dapr state management

In this quickstart, you'll create a microservice to demonstrate Dapr's state management API. The service generates messages to store data in a state store. See [Why state management](#why-state-management) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/state-management/) link for more information about Dapr and State Management.

> **Note:** This example leverages Dapr client SDK.  If you are looking for the example using only Http requests [click here](../http/).

This quickstart includes one service: Python service `order-processor`

This section shows how to run applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.

Open a new terminal window and run  `order-processor` using the multi app run template defined in [dapr.yaml](./dapr.yaml):

## Run Python service with Dapr

1. Open a new terminal window and navigate to `order-processor` directory: 

<!-- STEP
name: Install python dependencies
-->

```bash
uv sync
```

<!-- END_STEP -->

2. Run the Python service app with Dapr: 

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - "Saving Order: {'orderId': '1'}"
  - "Saving Order: {'orderId': '2'}"
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->
    
```bash
uv run dapr run -f .
```

<!-- END_STEP -->

```bash
dapr stop -f .
```

## Inspect the state store with the Dapr Dev Dashboard

The free [Dapr Dev Dashboard](https://docs.dapr.io/developing-applications/local-development/dapr-dev-dashboard/) lists the records in the `statestore` component, so you can inspect the state the order processor writes without adding code.

This app saves each order and deletes it again in the same loop iteration, so by default no records are left to look at. To keep them in the state store, comment out the delete call in `order-processor/app.py`:

```python
# Delete state from the state store
# client.delete_state(store_name=DAPR_STORE_NAME, key=orderId)
# print(f'Deleting Order: {order}')
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

An alternative to running all or multiple applications at once is to run single apps one-at-a-time using multiple `dapr run .. -- uv run python app.py` commands.  This next section covers how to do this.

1. Run the Python service app with Dapr: 

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - "Saving Order: {'orderId': '1'}"
  - "Saving Order: {'orderId': '2'}"
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->
    
```bash
cd ./order-processor
dapr run --app-id order-processor --resources-path ../../../resources/ -- uv run python app.py
```

<!-- END_STEP -->

```bash
dapr stop --app-id order-processor
```
