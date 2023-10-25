# Dapr pub/sub

In this quickstart, you'll create a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a publish-subscribe pattern. The publisher will generate messages of a specific topic, while subscribers will listen for messages of specific topics. See [Why Pub-Sub](#why-pub-sub) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/pubsub/) link for more information about Dapr and Pub-Sub.

> **Note:** This example leverages the Dapr client SDK.  If you are looking for the example using only HTTP `requests` [click here](../http).

This quickstart includes one publisher:

- Node client message generator `checkout` 

And one subscriber: 
 
- Node subscriber `order-processor`

## Run all apps with multi-app run template file:

This section shows how to run both applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.  

1. Install dependencies: 

<!-- STEP
name: Install Node dependencies
-->

```bash
cd ./order-processor
npm install
cd ..
cd ./checkout
npm install
cd ..
```
<!-- END_STEP -->

2. Open a new terminal window and run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Started Dapr with app id "order-processor"'
  - 'Started Dapr with app id "checkout-sdk"'
  - '== APP - checkout-sdk == Published data: {"orderId":1}'
  - '== APP - order-processor == Subscriber received: {"orderId":1}'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 15
timeout_seconds: 30
-->

```bash
dapr run -f .
```

The terminal console output should look similar to this:

```text
== APP - checkout-sdk == Published data: {"orderId":1}
== APP - order-processor == Subscriber received: {"orderId":1}
== APP - checkout-sdk == Published data: {"orderId":2}
== APP - order-processor == Subscriber received: {"orderId":2}
== APP - checkout-sdk == Published data: {"orderId":3}
== APP - order-processor == Subscriber received: {"orderId":3}
== APP - checkout-sdk == Published data: {"orderId":4}
== APP - order-processor == Subscriber received: {"orderId":4}
== APP - checkout-sdk == Published data: {"orderId":5}
== APP - order-processor == Subscriber received: {"orderId":5}
== APP - checkout-sdk == Published data: {"orderId":6}
== APP - order-processor == Subscriber received: {"orderId":6}
== APP - checkout-sdk == Published data: {"orderId":7}
== APP - order-processor == Subscriber received: {"orderId":7}
== APP - checkout-sdk == Published data: {"orderId":8}
== APP - order-processor == Subscriber received: {"orderId":8}
== APP - checkout-sdk == Published data: {"orderId":9}
== APP - order-processor == Subscriber received: {"orderId":9}
== APP - checkout-sdk == Published data: {"orderId":10}
== APP - order-processor == Subscriber received: {"orderId":10}
```

3. Stop and clean up application processes

```bash
dapr stop -f .
```
<!-- END_STEP -->

## Run a single app at a time with Dapr (Optional)

An alternative to running all or multiple applications at once is to run single apps one-at-a-time using multiple `dapr run .. -- dotnet run` commands.  This next section covers how to do this. 

### Run Node message subscriber with Dapr

1. Install dependencies: 

```bash
cd ./order-processor
npm install
```

2. Run the Node publisher app with Dapr: 

```bash
dapr run --app-port 5002 --app-id order-processing-sdk --app-protocol http --dapr-http-port 3501 --resources-path ../../../components -- npm run start
```

### Run Node message publisher with Dapr

1. Install dependencies: 

```bash
cd ./checkout
npm install
```

2. Run the Node publisher app with Dapr: 
  
```bash
dapr run --app-id checkout-sdk --app-protocol http --dapr-http-port 3500 --resources-path ../../../components -- npm run start
```

### Stop the apps and clean up

```bash
dapr stop --app-id checkout-sdk
dapr stop --app-id order-processor-sdk
```
