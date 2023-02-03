# Dapr pub/sub

In this quickstart, you'll create a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a publish-subcribe pattern. The publisher will generate messages of a specific topic, while subscribers will listen for messages of specific topics. See [Why Pub-Sub](#why-pub-sub) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/pubsub/) link for more information about Dapr and Pub-Sub.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

This quickstart includes one publisher:

- Node client message generator `checkout` 

And one subscriber: 
 
- Node subscriber `order-processor`

### Run Node message subscriber with Dapr

1. Install dependencies: 

<!-- STEP
name: Install Node dependencies
-->

```bash
cd ./order-processor
npm install
```
<!-- END_STEP -->
2. Run the Node publisher app with Dapr: 

<!-- STEP
name: Run Node publisher
expected_stdout_lines:
  - "You're up and running! Both Dapr and your app logs will appear here."
  - "Exited App successfully"
expected_stderr_lines:
working_dir: ./order-processor
output_match_mode: substring
background: true
sleep: 10
-->
    
```bash
dapr run --app-id order-processor-http --resources-path ../../../components/  --app-port 5001 -- node .
```

<!-- END_STEP -->

### Run Node message publisher with Dapr

1. Install dependencies: 

<!-- STEP
name: Install Node dependencies
-->

```bash
cd ./checkout
npm install
```
<!-- END_STEP -->
2. Run the Node publisher app with Dapr: 

<!-- STEP
name: Run Node publisher
expected_stdout_lines:
  - '== APP == Published data: {"orderId":2}'
  - '== APP == Published data: {"orderId":3}'
  - "Exited App successfully"
expected_stderr_lines:
working_dir: ./checkout
output_match_mode: substring
background: true
sleep: 10
-->
    
```bash
dapr run --app-id checkout-http --resources-path ../../../components/  --app-port 5001 -- node .
```

<!-- END_STEP -->

```bash
dapr stop --app-id checkout-http
dapr stop --app-id order-processor-http
```
