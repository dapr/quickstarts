# Dapr pub/sub

In this quickstart, you'll create a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a publish-subcribe pattern. The publisher will generate messages of a specific topic, while subscribers will listen for messages of specific topics. See [Why Pub-Sub](#why-pub-sub) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/pubsub/) link for more information about Dapr and Pub-Sub.

> **Note:** This example leverages the [Dapr PHP SDK](https://docs.dapr.io/developing-applications/sdks/php/).  If you are looking for the example using only HTTP `curl` [click here](../http).

This quickstart includes one publisher:

- PHP client message generator `checkout`

And one subscriber:

- PHP subscriber `order-processor`

## Run all apps with multi-app run template file:

This section shows how to run both applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.

1. Install dependencies:

<!-- STEP
name: Install PHP dependencies
-->

```bash
composer install
```
<!-- END_STEP -->

2. Open a new terminal window and run the multi app run template:


<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Validating config and starting app "order-processor-sdk"'
  - 'Validating config and starting app "checkout-sdk"'
  - 'Published data: {"orderId":1}'
  - 'Subscriber received : 1'
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
== APP - order-processor-sdk == Order processor listening on port 6002
== APP - checkout-sdk == Published data: {"orderId":1}
== APP - order-processor-sdk == Dapr pub/sub is subscribed to: [{"pubsubname":"orderpubsub","topic":"orders","route":"orders"}]
== APP - order-processor-sdk == Subscriber received : 1
== APP - checkout-sdk == Published data: {"orderId":2}
== APP - order-processor-sdk == Subscriber received : 2
== APP - checkout-sdk == Published data: {"orderId":3}
== APP - order-processor-sdk == Subscriber received : 3
== APP - checkout-sdk == Published data: {"orderId":4}
== APP - order-processor-sdk == Subscriber received : 4
== APP - checkout-sdk == Published data: {"orderId":5}
== APP - order-processor-sdk == Subscriber received : 5
```

3. Stop and clean up application processes

```bash
dapr stop -f .
```
<!-- END_STEP -->

## Run a single app at a time with Dapr (Optional)

An alternative to running all or multiple applications at once is to run single apps one-at-a-time using multiple `dapr run .. -- php app.php` commands.  This next section covers how to do this.

### Run PHP message subscriber with Dapr

1. Install dependencies:

```bash
composer install
```

2. Run the PHP subscriber app with Dapr:

```bash
cd ./order-processor
dapr run --app-id order-processor-sdk --resources-path ../../../components/ --app-port 6002 -- php app.php
```

### Run PHP message publisher with Dapr

1. Install dependencies:

```bash
composer install
```

2. Run the PHP publisher app with Dapr:

```bash
cd ./checkout
dapr run --app-id checkout-sdk --resources-path ../../../components/ -- php app.php
```

### Stop the apps and clean up

```bash
dapr stop --app-id checkout-sdk
dapr stop --app-id order-processor-sdk
```
