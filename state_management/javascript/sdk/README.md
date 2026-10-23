# Dapr state management (SDK Client)

In this quickstart, you'll create a microservice to demonstrate Dapr's state management API. The service generates messages to store data in a state store. See [Why state management](#why-state-management) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/state-management/) link for more information about Dapr and State Management.

> **Note:** This example uses the Dapr JavaScript SDK. For the example using HTTP requests directly, [click here](../http/).

This quickstart includes one service: Node client service `order-processor`

Use Node.js 22 or later and an initialized Dapr runtime (`dapr init`). This sample pins `@dapr/dapr` to `3.19.0`; `npm ci` installs that version from the checked-in lockfile.

This section shows how to run applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.

Open a new terminal window and run  `order-processor` using the multi app run template defined in [dapr.yaml](./dapr.yaml):

1. Open a new terminal window and navigate to `order-processor` directory:

<!-- STEP
name: Install Node Dependencies
-->

```bash
  cd ./order-processor
  npm ci
  cd ..
```

<!-- END_STEP -->

2. Run the Node service app with Dapr:

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - "Saving Order:  { orderId: '1' }"
  - "Getting Order:  { orderId: '1' }"
  - "Deleting Order:  { orderId: '1' }"
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 60
timeout_seconds: 90
-->

```bash
  dapr run -f .
```

<!-- END_STEP -->

3. Stop and cleanup application process

<!-- STEP
name: Stop order-processor service
-->

```bash
  dapr stop -f .
```
<!-- END_STEP -->

## Run a single app at a time with Dapr (Optional)

An alternative to running all or multiple applications at once is to run single apps one-at-a-time using multiple `dapr run .. -- npm start` commands.  This next section covers how to do this.

## Run Node service with Dapr

1. Navigate to folder and install dependencies: 

<!-- STEP
name: Install Node dependencies for individual run
-->

```bash
  cd ./order-processor
  npm ci
```

<!-- END_STEP -->

2. Run the Node service app with Dapr: 
    
<!-- STEP
name: Run order-processor individually
expected_stdout_lines:
  - "Saving Order:  { orderId: '1' }"
  - "Getting Order:  { orderId: '1' }"
  - "Deleting Order:  { orderId: '1' }"
  - "Exited App successfully"
expected_stderr_lines:
working_dir: ./order-processor
output_match_mode: substring
match_order: none
timeout_seconds: 90
-->

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ -- npm start
```

<!-- END_STEP -->

3. To stop the app before it finishes:

```bash
dapr stop --app-id order-processor
```
