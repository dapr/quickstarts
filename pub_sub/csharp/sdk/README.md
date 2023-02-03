# Dapr pub/sub

In this quickstart, you'll create a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a publish-subcribe pattern. The publisher will generate messages of a specific topic, while subscribers will listen for messages of specific topics. See [Why Pub-Sub](https://docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-overview/) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/pubsub/) link for more information about Dapr and Pub-Sub.

> **Note:** This example leverages the Dapr client SDK.  If you are looking for the example using only HTTP [click here](../http).

This quickstart includes one publisher:

- Dotnet client message generator `checkout` 

And one subscriber: 
 
- Dotnet subscriber `order-processor`

### Run Dotnet message subscriber with Dapr

1. Navigate to the directory and install dependencies: 

<!-- STEP
name: Install Dotnet dependencies
-->

```bash
cd ./order-processor
dotnet restore
dotnet build
```
<!-- END_STEP -->
2. Run the Dotnet subscriber app with Dapr: 

<!-- STEP
name: Run Dotnet subscriber
expected_stdout_lines:
  - "You're up and running! Both Dapr and your app logs will appear here."
  - '== APP == Subscriber received : Order { OrderId = 2 }'
  - "Exited Dapr successfully"
  - "Exited App successfully"
expected_stderr_lines:
working_dir: ./order-processor
output_match_mode: substring
background: true
sleep: 10
-->


```bash
dapr run --app-id order-processor --resources-path ../../../components/ --app-port 7002 -- dotnet run --project .
```

<!-- END_STEP -->
### Run Dotnet message publisher with Dapr

1. Navigate to the directory and install dependencies: 

<!-- STEP
name: Install Dotnet dependencies
-->

```bash
cd ./checkout
dotnet restore
dotnet build
```
<!-- END_STEP -->
2. Run the Dotnet publisher app with Dapr: 

<!-- STEP
name: Run Dotnet publisher
expected_stdout_lines:
  - "You're up and running! Both Dapr and your app logs will appear here."
  - '== APP == Published data: Order { OrderId = 1 }'
  - '== APP == Published data: Order { OrderId = 2 }'
  - "Exited App successfully"
  - "Exited Dapr successfully"
expected_stderr_lines:
working_dir: ./checkout
output_match_mode: substring
background: true
sleep: 10
-->
    
```bash
dapr run --app-id checkout-sdk --resources-path ../../../components/ -- dotnet run --project .
```

<!-- END_STEP -->

```bash
dapr stop --app-id order-processor
dapr stop --app-id checkout-sdk
```
