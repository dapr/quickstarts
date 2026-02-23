# Dapr Conversation API (Go HTTP)

In this quickstart, you'll send an input to a mock Large Language Model (LLM) using Dapr's Conversation API. This API is responsible for providing one consistent API entry point to talk to underlying LLM providers.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/) link for more information about Dapr and the Conversation API.

> **Note:** This example leverages HTTP `requests` only. If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

This quickstart includes one app:

- `conversation.go`, responsible for sending an input to the underlying LLM and retrieving an output. It includes a secondary conversation request to showcase tool calling to the underlying LLM.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  

This example uses the Ollama LLM component for local inference. You can switch to the OpenAI component by adding your API token in the provided OpenAI component file and changing the component name from `ollama` to `openai`. For other available integrations, see the other [supported conversation components](https://docs.dapr.io/reference/components-reference/supported-conversation/).

Open a new terminal window and run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - '== APP - conversation == Input sent: What is dapr?'
  - '== APP - conversation == Usage:'
  - '== APP - conversation == Output response:'
  - '== APP - conversation == Tool calling input sent: What is the weather like in San Francisco in celsius?'
  - '== APP - conversation == Tool calls detected:'
  - '== APP - conversation == Tool call: map[function:map[arguments:'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: false
sleep: 15
timeout_seconds: 60
-->

```bash
dapr run -f .
```

The terminal console output should look similar to this, where:

- The app first sends an input `What is dapr?` to the Ollama LLM component with a structured JSON response format.
- The LLM returns a JSON object with an `answer` field describing Dapr.
- The app then sends a weather request to the component with tools available to the LLM.
- The LLM responds with a tool call to `get_weather`.

```text
== APP - conversation == Input sent: What is dapr?
== APP - conversation == Output response: { "answer": "Dapr is an open-source, cross-platform microservices framework..." }
== APP - conversation == Tool calling input sent: What is the weather like in San Francisco in celsius?
== APP - conversation == Tool calls detected:
== APP - conversation == Tool call: map[function:map[arguments:... name:get_weather] id:call_xxxx]
```

<!-- END_STEP -->

2. Stop and clean up application processes.

```bash
dapr stop -f .
```

## Run the app with the Dapr CLI

1. Run the application:

```bash
dapr run --app-id conversation --resources-path ../../../components -- go run conversation.go
```

The terminal console output should look similar to this, where:

- The app first sends an input `What is dapr?` to the Ollama LLM component with a structured JSON response format.
- The LLM returns a JSON object with an `answer` field describing Dapr.
- The app then sends a weather request with tools available to the LLM.
- The LLM responds with a tool call to `get_weather`.

```text
== APP - conversation == Input sent: What is dapr?
== APP - conversation == Output response: { "answer": "Dapr is an open-source, cross-platform microservices framework..." }
== APP - conversation == Tool calling input sent: What is the weather like in San Francisco in celsius?
== APP - conversation == Tool calls detected:
== APP - conversation == Tool call: map[function:map[arguments:... name:get_weather] id:call_xxxx]
```