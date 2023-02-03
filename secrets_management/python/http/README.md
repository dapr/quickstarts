# Dapr secrets management (HTTP client)

In this quickstart, you'll create a microservice to demonstrate Dapr's secrets management API. The service fetches secret from a secret store. See [Why secrets management](#why-secrets-management) to understand when to use this API.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/secrets/) link for more information about Dapr and Secrets Management.

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
  - "== APP == INFO:root:Fetched Secret: {'secret': 'YourPasskeyHere'}"
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
-->
    
```bash
cd ./order-processor
dapr run --app-id order-processor --resources-path ../../../components/ -- python3 app.py
```

<!-- END_STEP -->

```bash
dapr stop --app-id order-processor
```
