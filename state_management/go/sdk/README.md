# Dapr state management

In this quickstarts, you'll create a microservice to demonstrate Dapr's state management API. The service generates messages to store data in a state store.

Visit the Dapr documentation on [State Management](https://docs.dapr.io/developing-applications/building-blocks/state-management/) for more information.

> **Note:** This example leverages the Dapr Client SDK. You can find an example using plain HTTP in the [`http` folder](../http/).

This quickstart includes one service: Go client service `order-processor`

## Run multiple apps with multi-app run template file

This section shows how to run applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.

Open a new terminal window and run  `order-processor` using the multi app run template defined in [dapr.yaml](./dapr.yaml):

1. Run the Go service app with Dapr:

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP - order-processor == Retrieved Order: {"orderId":1}'
  - '== APP - order-processor == Retrieved Order: {"orderId":2}'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 15
-->

```bash
  dapr run -f  .
```

2. Stop and cleanup application process

```bash
dapr stop -f .
```
<!-- END_STEP -->

## Run a single app at a time with Dapr (Optional)

An alternative to running all or multiple applications at once is to run single apps one-at-a-time using multiple `dapr run .. -- go run` commands.  This next section covers how to do this.

1. Run the Go service app with Dapr:

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP == Retrieved Order: {"orderId":1}'
  - '== APP == Retrieved Order: {"orderId":2}'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 15
-->

```bash
cd ./order-processor
dapr run --app-id order-processor --resources-path ../../../resources/ -- go run .
```

The Terminal console output should look similar to this:

```text
You're up and running! Both Dapr and your app logs will appear here.

    == APP - order-processor == Saved Order: {"orderId":1}
		== APP - order-processor == Retrieved Order: {"orderId":1}
		== APP - order-processor == Deleted Order: {"orderId":1}
		== APP - order-processor == Saved Order: {"orderId":2}
		== APP - order-processor == Retrieved Order: {"orderId":2}
		== APP - order-processor == Deleted Order: {"orderId":2}
```

2. Stop and clean up application processes
dapr stop --app-id order-processor

<!-- END_STEP -->
