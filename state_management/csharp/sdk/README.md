# Dapr state management

In this quickstart, you'll create a microservice to demonstrate Dapr's state management API. The service generates messages to store data in a state store. See [Why state management](https://docs.dapr.io/developing-applications/building-blocks/state-management/) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/state-management/) link for more information about Dapr and State Management.

> **Note:** This example leverages the Dapr client SDK.  If you are looking for the example using only HTTP [click here](../http).

This quickstart includes one service: Dotnet client service `order-processor`

## Run all apps with multi-app run template file

This section shows how to run applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.

1. Open a new terminal window and run  `order-processor` using the multi app run template defined in [dapr.yaml](./dapr.yaml):

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP - order-processor == Getting Order: Order { orderId = 1 }'
  - '== APP - order-processor == Getting Order: Order { orderId = 2 }'  
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 100
-->

```bash
dapr run -f .
```

2. Stop and clean up application processes

```bash
dapr stop -f .
```
<!-- END_STEP -->

## Run a single app at a time with Dapr (Optional)

An alternative to running all or multiple applications at once is to run single apps one-at-a-time using multiple `dapr run .. -- dotnet run` commands.  This next section covers how to do this.

1. Run the Dotnet service app with Dapr:

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP == Getting Order: Order { orderId = 1 }'
  - '== APP == Getting Order: Order { orderId = 2 }'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->

```bash
cd ./order-processor
dapr run --app-id order-processor --resources-path ../../../resources/ -- dotnet run
```
<!-- END_STEP -->

The Terminal console output should look similar to this:

```text
You're up and running! Both Dapr and your app logs will appear here.

== APP == Saving Order: Order { orderId = 1 }
== APP == Getting Order: Order { orderId = 1 }
== APP == Deleting Order: Order { orderId = 1 }
== APP == Saving Order: Order { orderId = 2 }
== APP == Getting Order: Order { orderId = 2 }
== APP == Deleting Order: Order { orderId = 2 }
== APP == Saving Order: Order { orderId = 3 }
== APP == Getting Order: Order { orderId = 3 }
== APP == Deleting Order: Order { orderId = 3 }
```

2. Stop and clean up application processes

```bash
dapr stop --app-id order-processor
```
