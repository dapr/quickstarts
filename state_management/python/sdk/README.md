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
cd ./order-processor
pip3 install -r requirements.txt 
cd ..
```

<!-- END_STEP -->

2. Run the Python service app with Dapr: 

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - "== APP - order-processor == INFO:root:Saving Order: {'orderId': '1'}"
  - "== APP - order-processor == INFO:root:Saving Order: {'orderId': '2'}"
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->
    
```bash
dapr run -f .
```

<!-- END_STEP -->

```bash
dapr stop -f .
```

## Run a single app at a time with Dapr (Optional)

An alternative to running all or multiple applications at once is to run single apps one-at-a-time using multiple `dapr run .. -- python3 app.py` commands.  This next section covers how to do this.

1. Run the Python service app with Dapr: 

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
