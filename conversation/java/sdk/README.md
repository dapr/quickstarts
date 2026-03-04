# Dapr Conversation API (Java SDK)

In this quickstart, you'll send an input to a mock Large Language Model (LLM) using Dapr's Conversation API. This API is responsible for providing one consistent API entry point to talk to underlying LLM providers. This example demonstrates both simple conversation and tool calling capabilities.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/) link for more information about Dapr and the Conversation API.

This quickstart includes one app:

- Conversation, responsible for sending an input to the underlying LLM and retrieving an output, including tool call support.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template file](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) and Dapr CLI with `dapr run -f .`.  

This example uses the Ollama LLM component for local inference. You can switch to the OpenAI component by adding your API token in the provided OpenAI component file and changing the component name from `ollama` to `openai`. For other available integrations, see the other [supported conversation components](https://docs.dapr.io/reference/components-reference/supported-conversation/).

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
  - '== APP - conversation == === Simple Conversation ==='
  - '== APP - conversation == Conversation input sent: What is dapr?'
  - '== APP - conversation == Output response:'
  - '== APP - conversation == === Tool Calling ==='
  - '== APP - conversation == Tool calling input sent: What is the weather like in San Francisco in celsius?'
  - '== APP - conversation == Tool calls'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 30
timeout_seconds: 120
-->

```bash
dapr run -f .
```

The terminal console output should look similar to this, where:

- The app sends a simple conversation input `What is dapr?` to the Ollama LLM component with a structured JSON response format.
- The LLM returns a JSON object with an `answer` field describing Dapr.
- The app then demonstrates tool calling by sending `What is the weather like in San Francisco in celsius?`.
- The response includes detected tool calls with function name and arguments.

```text
== APP - conversation == === Simple Conversation ===
== APP - conversation == Conversation input sent: What is dapr?
== APP - conversation == Output response: {"answer":"Dapr is an open-source, cross-platform microservices framework..."}
== APP - conversation == Conversation model : llama3.2:latest

== APP - conversation == === Tool Calling ===
== APP - conversation == Tool calling input sent: What is the weather like in San Francisco in celsius?
== APP - conversation == Tool calls detected:
== APP - conversation == Tool call: {"id": "call_xxxx", "function": {"name": "get_weather", "arguments": {"location":"San Francisco, CA","unit":"celsius"}}}
== APP - conversation == Function name: get_weather
== APP - conversation == Function arguments: {"location":"San Francisco, CA","unit":"celsius"}
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
java -jar target/ConversationAIService-0.0.1-SNAPSHOT.jar com.service.Conversation
```

2. Run the Dapr process alongside the application

```bash
dapr run --app-id conversation --resources-path ../../../components/
```

The terminal console output should look similar to this:

```text
=== Simple Conversation ===
Conversation input sent: What is dapr?
Output response: {"answer":"Dapr is an open-source, cross-platform microservices framework..."}
Conversation model : llama3.2:latest

=== Tool Calling ===
Tool calling input sent: What is the weather like in San Francisco in celsius?
Tool calls detected:
Tool call: {"id": "call_xxxx", "function": {"name": "get_weather", "arguments": {"location":"San Francisco, CA","unit":"celsius"}}}
Function name: get_weather
Function arguments: {"location":"San Francisco, CA","unit":"celsius"}
```
