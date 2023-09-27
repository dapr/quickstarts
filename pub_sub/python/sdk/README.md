# Dapr pub/sub

In this quickstart, you'll create a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a publish-subcribe pattern. The publisher will generate messages of a specific topic, while subscribers will listen for messages of specific topics. See [Why Pub-Sub](#why-pub-sub) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/pubsub/) link for more information about Dapr and Pub-Sub.

> **Note:** This example leverages the Dapr client SDK.  If you are looking for the example using only HTTP `requests` [click here](../http).

This quickstart includes one publisher:

- Python client message generator `checkout` 

And one subscriber: 
 
- Python subscriber `order-processor`

## Run all apps with multi-app run template file:

This section shows how to run both applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.  

1. Install dependencies: 

1. Run the Python subscriber app (flask version) with Dapr: 

<!-- STEP
name: Install Python dependencies
-->

```bash
cd ./checkout
pip3 install -r requirements.txt
cd ..
cd ./order-processor
pip3 install -r requirements.txt
cd ..
cd ./order-processor-fastapi
pip3 install -r requirements.txt
cd ..
```
<!-- END_STEP -->

2. Open a new terminal window and run the multi app run template:


<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Started Dapr with app id "order-processor-sdk"'
  - 'Started Dapr with app id "checkout-sdk"'
  - '== APP - checkout-sdk == INFO:root:Published data: {"orderId": 1}'
  - '== APP - order-processor-sdk == Subscriber received : 1'
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
== APP - checkout-sdk == INFO:root:Published data: {"orderId": 1}
== APP - order-processor-sdk == Subscriber received : 1
== APP - order-processor-sdk == 127.0.0.1 - - [04/Sep/2023 11:15:19] "POST /orders HTTP/1.1" 200 -
== APP - checkout-sdk == INFO:root:Published data: {"orderId": 2}
== APP - order-processor-sdk == 127.0.0.1 - - [04/Sep/2023 11:15:20] "POST /orders HTTP/1.1" 200 -
== APP - order-processor-sdk == Subscriber received : 2
== APP - checkout-sdk == INFO:root:Published data: {"orderId": 3}
== APP - order-processor-sdk == Subscriber received : 3
== APP - order-processor-sdk == 127.0.0.1 - - [04/Sep/2023 11:15:21] "POST /orders HTTP/1.1" 200 -
== APP - checkout-sdk == INFO:root:Published data: {"orderId": 4}
== APP - order-processor-sdk == Subscriber received : 4
== APP - order-processor-sdk == 127.0.0.1 - - [04/Sep/2023 11:15:22] "POST /orders HTTP/1.1" 200 -
== APP - checkout-sdk == INFO:root:Published data: {"orderId": 5}
== APP - order-processor-sdk == Subscriber received : 5
== APP - order-processor-sdk == 127.0.0.1 - - [04/Sep/2023 11:15:23] "POST /orders HTTP/1.1" 200 -
== APP - checkout-sdk == INFO:root:Published data: {"orderId": 6}
== APP - order-processor-sdk == Subscriber received : 6
== APP - order-processor-sdk == 127.0.0.1 - - [04/Sep/2023 11:15:24] "POST /orders HTTP/1.1" 200 -
== APP - checkout-sdk == INFO:root:Published data: {"orderId": 7}
== APP - order-processor-sdk == 127.0.0.1 - - [04/Sep/2023 11:15:25] "POST /orders HTTP/1.1" 200 -
== APP - order-processor-sdk == Subscriber received : 7
== APP - checkout-sdk == INFO:root:Published data: {"orderId": 8}
== APP - order-processor-sdk == 127.0.0.1 - - [04/Sep/2023 11:15:26] "POST /orders HTTP/1.1" 200 -
== APP - order-processor-sdk == Subscriber received : 8
== APP - checkout-sdk == INFO:root:Published data: {"orderId": 9}
== APP - order-processor-sdk == 127.0.0.1 - - [04/Sep/2023 11:15:27] "POST /orders HTTP/1.1" 200 -
== APP - order-processor-sdk == Subscriber received : 9

```

3. Stop and clean up application processes

```bash
dapr stop -f .
```
<!-- END_STEP -->

## Run a single app at a time with Dapr (Optional)

An alternative to running all or multiple applications at once is to run single apps one-at-a-time using multiple `dapr run .. -- python3 app.py` commands.  This next section covers how to do this. 

### Run Python message subscriber with Dapr

1. Install dependencies: 

```bash
cd ./order-processor
pip3 install -r requirements.txt
```

2. Run the Python subscriber app with Dapr: 

```bash
dapr run --app-id order-processor-sdk --resources-path ../../../components/ --app-port 6001 -- uvicorn app:app --port 6002
```

### Run Python message publisher with Dapr

1. Install dependencies: 

```bash
cd ./checkout
pip3 install -r requirements.txt 
```

2. Run the Python publisher app with Dapr: 

```bash
dapr run --app-id checkout-sdk --resources-path ../../../components/ -- python3 app.py
```

### Stop the apps and clean up

```bash
dapr stop --app-id checkout-sdk
dapr stop --app-id order-processor-sdk
dapr stop --app-id order-processor-sdk-fastapi
```
