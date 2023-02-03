# Dapr pub/sub (HTTP requests client)

In this quickstart, you'll create a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a publish-subcribe pattern. The publisher will generate messages of a specific topic, while subscribers will listen for messages of specific topics. See [Why Pub-Sub](#why-pub-sub) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/pubsub/) link for more information about Dapr and Pub-Sub.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

This quickstart includes one publisher:

- Python client message generator `checkout` 

And one subscriber: 
 
- Python subscriber `order-processor`

### Run Python message subscriber with Dapr

2. Install dependencies: 

<!-- STEP
name: Install python dependencies
-->

```bash
cd ./order-processor
pip3 install -r requirements.txt 
```
<!-- END_STEP -->
3. Run the Python subscriber app with Dapr: 

<!-- STEP
name: Run python subscriber
expected_stdout_lines:
  - '== APP == Subscriber received : 2'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
working_dir: ./order-processor
background: true
sleep: 10
-->


```bash
dapr run --app-id order-processor-http --resources-path ../../../components/ --app-port 6001 -- python3 app.py
```

<!-- END_STEP -->

### Run Python message publisher with Dapr

1. Install dependencies: 

<!-- STEP
name: Install python dependencies
-->

```bash
cd ./checkout
pip3 install -r requirements.txt 
```
<!-- END_STEP -->
3. Run the Python publisher app with Dapr: 

<!-- STEP
name: Run python publisher
expected_stdout_lines:
  - '== APP == INFO:root:Published data: {"orderId": 1}'
  - '== APP == INFO:root:Published data: {"orderId": 2}'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
working_dir: ./checkout
background: true
sleep: 10
-->
    
```bash
dapr run --app-id checkout-http --resources-path ../../../components/ -- python3 app.py
```

<!-- END_STEP -->

```bash
dapr stop --app-id checkout-http
dapr stop --app-id order-processor-http
```
