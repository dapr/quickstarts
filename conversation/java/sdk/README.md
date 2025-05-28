# Dapr Conversation API (Java SDK)

In this quickstart, you'll send an input to a mock Large Language Model (LLM) using Dapr's Conversation API. This API is responsible for providing one consistent API entry point to talk to underlying LLM providers.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/) link for more information about Dapr and the Conversation API.

> **Note:** This example leverages SDK `requests` only.

This quickstart includes one app:

- Conversation, responsible for sending an input to the underlying LLM and retrieving an output.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template file](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) and Dapr CLI with `dapr run -f .`.  

This example uses the default LLM Component provided by Dapr which simply echoes the input provided, for testing purposes. Integrate with popular LLM models by using one of the other [supported conversation components](https://docs.dapr.io/reference/components-reference/supported-conversation/).

Open a new terminal window and run the multi app run template:

1. Open a new terminal window and navigate to `order-processor` directory:

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
  - '== APP - conversation-component == Sending the following input to LLM: Hello How are you? This is the my number 672-123-4567'
  - '== APP - conversation-component == Conversation output: Hello How are you? This is the my number <ISBN>'
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

- The app sends an input `Hello How are you? This is the my number 672-123-4567` to the `echo` Component mock LLM.
- The mock LLM echoes `Hello How are you? This is the my number <ISBN>`.

```text
== APP - conversation-component == Sending the following input to LLM: Hello How are you? This is the my number 672-123-4567
== APP - conversation-component == Conversation output: Hello How are you? This is the my number <ISBN>
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
java -jar ConversationAIService-0.0.1-SNAPSHOT.jar com.service.ConversationAIApplication
```

2. Run the Dapr process alongside the application.

```bash
dapr run --app-id conversation --resources-path ../../../components/
```

The terminal console output should look similar to below, where:

- The app sends an input `Hello How are you? This is the my number 672-123-4567` to the `echo` Component mock LLM.
- The mock LLM echoes `Hello How are you? This is the my number <ISBN>`.

```text
== APP - conversation-component == Sending the following input to LLM: Hello How are you? This is the my number 672-123-4567
== APP - conversation-component == Conversation output: Hello How are you? This is the my number <ISBN>
```
