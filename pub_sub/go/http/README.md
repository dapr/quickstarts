# Dapr pub/sub

In this quickstart, you'll create a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a publish-subcribe API. The publisher generates messages for a specific topic, while subscribers listen for messages on specific topics.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/pubsub/) link for more information about Dapr and Pub-Sub.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

This quickstart includes one publisher:

- Go client message generator `checkout` 

And one subscriber: 
 
- Go subscriber `order-processor`

### Run Go message subscriber with Dapr

1. Navigate to the directory and install dependencies: 

<!-- STEP
name: Build Go file
-->

```bash
cd ./order-processor
go build app.go
```
<!-- END_STEP -->

2. Run the Go subscriber app with Dapr: 

<!-- STEP
name: Run Go subscriber
expected_stdout_lines:
  - '== APP == Subscriber received:  {"orderId":10}'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->


```bash
cd ./order-processor
dapr run --app-port 6002 --app-id order-processor --app-protocol http --dapr-http-port 3501 --components-path ../../../components -- go run app.go
```

<!-- END_STEP -->

### Run Go message publisher with Dapr

1. Navigate to the directory and install dependencies: 

<!-- STEP
name: Build Go file
-->

```bash
cd ./checkout
go build app.go
```
<!-- END_STEP -->
2. Run the Go publisher app with Dapr: 

<!-- STEP
name: Run Go publisher
expected_stdout_lines:
  - '== APP == Published data:  {"orderId":1}'
  - '== APP == Published data:  {"orderId":2}'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->
    
```bash
cd ./checkout
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 --components-path ../../../components -- go run app.go
```

<!-- END_STEP -->

```bash
dapr stop --app-id checkout
dapr stop --app-id order-processor
```
