# Dapr pub/sub

In this quickstart, you'll create a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a publish-subcribe pattern. The publisher will generate messages of a specific topic, while subscribers will listen for messages of specific topics. See [Why Pub-Sub](#why-pub-sub) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/pubsub/) link for more information about Dapr and Pub-Sub.

> **Note:** This example leverages the Dapr client SDK.  If you are looking for the example using only HTTP `requests` [click here](../http).

This quickstart includes one publisher:

- Node client message generator `checkout` 

And one subscriber: 
 
- Node subscriber `order-processor`

### Run Node message publisher with Dapr

1. Open a new terminal window and navigate to `checkout` directory: 

```bash
cd checkout
```

2. Install dependencies: 

<!-- STEP
name: Install Node dependencies
working_dir: ./checkout
-->

```bash
npm install
```

3. Run the Node publisher app with Dapr: 

<!-- STEP
name: Run Node publisher
expected_stdout_lines:
  - "You're up and running! Both Dapr and your app logs will appear here."
  - '== APP == Received message "Message on A" on topic "A"'
  - '== APP == Received message "Message on C" on topic "C"'
  - "Exited Dapr successfully"
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
working_dir: ./checkout
background: true
sleep: 10
-->
    
```bash
npm start:dapr
```

<!-- END_STEP -->
### Run Node message subscriber with Dapr

1. Open a new terminal window and navigate to `checkout` directory: 

```bash
cd order-processor
```

2. Install dependencies: 

<!-- STEP
name: Install Node dependencies
working_dir: ./order-processor
-->

```bash
npm install
```

3. Run the Node subscriber app with Dapr: 

<!-- STEP
name: Run Node subscriber
expected_stdout_lines:
  - "You're up and running! Both Dapr and your app logs will appear here."
  - '== APP == Received message "Message on A" on topic "A"'
  - '== APP == Received message "Message on C" on topic "C"'
  - "Exited Dapr successfully"
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
working_dir: ./order-processor
background: true
sleep: 10
-->


```bash
npm start:dapr
```

<!-- END_STEP -->