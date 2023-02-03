# Dapr state management (HTTP client)

In this quickstart, you'll create a microservice to demonstrate Dapr's state management API. The service generates messages to store data in a state store. See [Why state management](#why-state-management) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/state-management/) link for more information about Dapr and State Management.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

This quickstart includes one service:
 
- Python service `order-processor`

### Run Python service with Dapr

1. Open a new terminal window and navigate to `order-processor` directory: 

<!-- STEP
name: Install python dependencies
-->

```bash
cd ./order-processor
pip3 install -r requirements.txt 
```

<!-- END_STEP -->
2. Run the Python service app with Dapr: 

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - "== APP == INFO:root:Saving Order: {'orderId': '1'}"
  - "== APP == INFO:root:Saving Order: {'orderId': '2'}"
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->
    
```bash
cd ./order-processor
dapr run --app-id order-processor --resources-path ../../../resources/ -- python3 app.py
```

<!-- END_STEP -->

```bash
dapr stop --app-id order-processor
```
