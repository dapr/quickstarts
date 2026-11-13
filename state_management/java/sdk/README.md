# Dapr state management (HTTP Client)

In this quickstart, there is a `order-processor` microservice to demonstrate Dapr's state management API. The service generates messages to store in a state store.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/state-management/) link for more information about Dapr and State Management.

> **Note:** This example leverages Dapr SDK client.  If you are looking for the example using the HTTP Client [click here](../http/).

## Pre-requisites

* [Dapr and Dapr Cli](https://docs.dapr.io/getting-started/install-dapr-cli/).
* Java JDK 17 (or greater):
  * [Microsoft JDK 17](https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-17)
  * [Oracle JDK 17](https://www.oracle.com/java/technologies/downloads/?er=221886#java17)
  * [OpenJDK 17](https://jdk.java.net/17/)
* [Apache Maven](https://maven.apache.org/install.html) version 3.x.

This quickstart includes one service: Java client service `order-processor`

## Run multiple apps with multi-app run template file

This section shows how to run applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.

Open a new terminal window and run  `order-processor` using the multi app run template defined in [dapr.yaml](./dapr.yaml):

### Run Java service with Dapr

1. Open a new terminal window and navigate to `order-processor` directory:

<!-- STEP
name: Build Java file
-->

```bash
  cd ./order-processor
  mvn clean install
  cd ..
```

<!-- END_STEP -->

2. Run the Java service app with Dapr:

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - 'Saving Order: 1'
  - 'Getting Order: 1'
  - 'Deleting Order: 1'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 60
-->

```bash
  dapr run -f .
```

3. Stop and cleanup application process

```bash
  dapr stop -f .
```
<!-- END_STEP -->

## Inspect the state store with the Dapr Dev Dashboard

The free [Dapr Dev Dashboard](https://docs.dapr.io/developing-applications/local-development/dapr-dev-dashboard/) lists the records in the `statestore` component, so you can watch the state the order processor writes without adding code.

1. [Install the dashboard](https://github.com/diagridio/dev-dashboard#installation-instructions), then start it in a separate terminal while the app is running:

    ```sh
    diagrid-dev-dashboard
    ```

    This opens http://localhost:9090 in your browser.

2. Go to the **State** page. Dapr prefixes state keys with the app id, so the orders appear as `order-processor||1`, `order-processor||2`, and so on.
3. This app saves each order and deletes it again in the same loop iteration, so refresh the page while it runs to watch one record at a time appear and disappear. Expand a row to see the full value, and use the **Decode base64** toggle if the value is encoded.

The Dev Dashboard is a local development tool. It is not intended for Kubernetes, production, or any shared environment.

## Run a single app at a time with Dapr (Optional)

1. Open a new terminal window and navigate to `order-processor` directory:

<!-- STEP
name: Build Java file
-->

```bash
cd ./order-processor
mvn clean install
cd ..
```

<!-- END_STEP -->
2. Run the Java service app with Dapr: 

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - 'Saving Order: 1'
  - 'Getting Order: 1'
  - 'Deleting Order: 1'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 60
-->

```bash
cd ./order-processor
dapr run --app-id order-processor --resources-path ../../../resources/ -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```
<!-- END_STEP -->

3. Stop and cleanup application process

```bash
dapr stop --app-id order-processor
```
