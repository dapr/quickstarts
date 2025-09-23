# Dapr Conversation API (Java SDK)

In this quickstart, you'll send an input to a mock Large Language Model (LLM) using Dapr's Conversation API. This API is responsible for providing one consistent API entry point to talk to underlying LLM providers.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/) link for more information about Dapr and the Conversation API.

This quickstart includes one app:

- Conversation, responsible for sending an input to the underlying LLM and retrieving an output.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template file](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) and Dapr CLI with `dapr run -f .`.  

This example uses the default LLM component (Echo) which simply returns the input for testing purposes. You can switch to the OpenAI component by adding your API token in the provided OpenAI component file and changing the component name from `echo` to `openai`. For other available integrations, see the other [supported conversation components](https://docs.dapr.io/reference/components-reference/supported-conversation/).

Open a new terminal window and run the multi app run template:

1. Open a new terminal window and navigate to `conversation` directory:

<!-- STEP
name: Install Java dependencies
-->

```bash
cd ./conversation
mvn clean install
cd ..
```

<!-- END_STEP -->

2. Run the console app with Dapr:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - '== APP - conversation == Input: What is Dapr?'
  - '== APP - conversation == Output response: What is Dapr?'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 15
timeout_seconds: 15
-->

```bash
dapr run -f .
```

The terminal console output should look similar to this, where:

- The app sends an input `What is Dapr?` to the `echo` Component mock LLM.
- The mock LLM echoes `What is Dapr?`.

```text
== APP - conversation == Input: What is Dapr?
== APP - conversation == Output response: What is Dapr?
```

<!-- END_STEP -->

Stop and clean up application processes.

<!-- STEP
name: Stop multi-app run
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->

## Run the app individually

1. Open a terminal and run the `conversation` app. Build the dependencies if you haven't already.

```bash
cd ./conversation
mvn clean install
java -jar ConversationAIService-0.0.1-SNAPSHOT.jar com.service.Conversation
```

2. Run the Dapr process alongside the application.

```bash
dapr run --app-id conversation --resources-path ../../../components/
```

The terminal console output should look similar to below, where:

- The app sends an input `What is Dapr?` to the `echo` Component mock LLM.
- The mock LLM echoes `What is Dapr?`.

```text
== APP - conversation == Input: What is Dapr?
== APP - conversation == Output response: What is Dapr?
```
