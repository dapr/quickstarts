# Service Invocation

In this quickstart, you'll create a checkout service and an order processor service to demonstrate how to use the service invocation API. The checkout service uses Dapr's http proxying capability to invoke a method on the order processing service.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/) link for more information about Dapr and service invocation.

This quickstart includes one checkout service:

- PHP client service `checkout` 

And one order processor service: 
 
- PHP order-processor service `order-processor`

## Run all apps with multi-app run template file:

This section shows how to run both applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.  

1. Open a new terminal window and install dependencies for `order-processor` and `checkout` apps:

<!-- STEP
name: Install PHP dependencies for order-processor and checkout
-->

```bash
composer install
```

<!-- END_STEP -->

2. Run the multi app run template:
<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Validating config and starting app "order-processor"'
  - 'Started Dapr with app id "order-processor"'
  - 'Writing log files to directory'
  - 'Validating config and starting app "checkout"'
  - 'Started Dapr with app id "checkout"'
  - 'Order passed: {"orderId":1}'
  - 'Order received : {"orderId":1}'
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
Order processor listening on port 8001
Order received : {"orderId":1}
Order passed: {"orderId":1}
Order received : {"orderId":2}
Order passed: {"orderId":2}
Order received : {"orderId":3}
Order passed: {"orderId":3}
Order received : {"orderId":4}
Order passed: {"orderId":4}
Order received : {"orderId":5}
Order passed: {"orderId":5}
Order received : {"orderId":6}
Order passed: {"orderId":6}
Order received : {"orderId":7}
Order passed: {"orderId":7}
Order received : {"orderId":8}
Order passed: {"orderId":8}
Order received : {"orderId":9}
Order passed: {"orderId":9}
Order received : {"orderId":10}
Order passed: {"orderId":10}
```

3. Stop and clean up application processes

```bash
dapr stop -f .
```
<!-- END_STEP -->

## Run a single app at a time with Dapr (Optional)

An alternative to running all or multiple applications at once is to run single apps one-at-a-time using multiple `dapr run .. -- php app.php` commands.  This next section covers how to do this. 

### Run PHP order-processor with Dapr

1. Install dependencies:

```bash
composer install
```

2. Run the PHP order-processor app with Dapr:

```bash
cd ./order-processor
dapr run --app-port 8001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- php app.php
```

### Run PHP checkout with Dapr

1. Open a new terminal window. Dependencies are shared with order-processor (already installed via `composer install` above).

2. Run the PHP checkout app with Dapr:

```bash
cd ./checkout
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- php app.php
```

### Stop and clean up application processes

```bash
dapr stop --app-id checkout
dapr stop --app-id order-processor
```
