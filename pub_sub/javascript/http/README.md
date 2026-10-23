# Dapr pub/sub

In this quickstart, you'll create a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a publish-subcribe pattern. The publisher will generate messages of a specific topic, while subscribers will listen for messages of specific topics. See [Why Pub-Sub](#why-pub-sub) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/pubsub/) link for more information about Dapr and Pub-Sub.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

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
```
<!-- END_STEP -->

2. Open a new terminal window and run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Started Dapr with app id "order-processor-http"'
  - 'Started Dapr with app id "checkout-http"'
  - 'Published data: {"orderId":10}'
  - 'Subscriber received: { orderId: 10 }'
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
Published data: {"orderId":1}
Subscriber received: { orderId: 1 }
Published data: {"orderId":2}
Subscriber received: { orderId: 2 }
Published data: {"orderId":3}
Subscriber received: { orderId: 3 }
Published data: {"orderId":4}
Subscriber received: { orderId: 4 }
Published data: {"orderId":5}
Subscriber received: { orderId: 5 }
Published data: {"orderId":6}
Subscriber received: { orderId: 6 }
Published data: {"orderId":7}
Subscriber received: { orderId: 7 }
Published data: {"orderId":8}
Subscriber received: { orderId: 8 }
Published data: {"orderId":9}
Subscriber received: { orderId: 9 }
Published data: {"orderId":10}
Subscriber received: { orderId: 10 }
```

3. Stop and clean up application processes

```bash
dapr stop -f .
```
<!-- END_STEP -->

## Run a single app at a time with Dapr (Optional)

An alternative to running all or multiple applications at once is to run single apps one-at-a-time using multiple `dapr run .. -- npm run start` commands.  This next section covers how to do this. 

### Run Node message subscriber with Dapr

1. Install dependencies: 

```bash
cd ./order-processor
npm install
```

2. Run the Node publisher app with Dapr: 
    
```bash
dapr run --app-port 5003 --app-id order-processing-http --app-protocol http --dapr-http-port 3501 --resources-path ../../../components -- npm run start
```

### Run Node message publisher with Dapr

1. Install dependencies: 

```bash
cd ./checkout
npm install
```

2. Run the Node publisher app with Dapr: 
    
```bash
dapr run --app-id checkout-http --app-protocol http --dapr-http-port 3500 --resources-path ../../../components -- npm run start
```

### Stop the apps and clean up

```bash
dapr stop --app-id checkout-http
dapr stop --app-id order-processor-http
```
