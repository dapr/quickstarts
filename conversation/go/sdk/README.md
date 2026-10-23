# Dapr Conversation API (Go SDK)

In this quickstart, you'll send an input to a mock Large Language Model (LLM) using Dapr's Conversation API. This API is responsible for providing one consistent API entry point to talk to underlying LLM providers.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/) link for more information about Dapr and the Conversation API.

> **Note:** This example leverages the Dapr SDK. If you are looking for the example using the HTTP API [click here](../http/).

This quickstart includes one app:

- `conversation.go`, responsible for sending an input to the underlying LLM and retrieving an output.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  

This example uses the Ollama LLM component for local inference. You can switch to the OpenAI component by adding your API token in the provided OpenAI component file and changing the component name from `ollama` to `openai`. For other available integrations, see the other [supported conversation components](https://docs.dapr.io/reference/components-reference/supported-conversation/).

Open a new terminal window and run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Input sent: What is dapr?'
  - 'Usage:'
  - 'Output response:'
  - 'Tool calling input sent: What is the weather like in San Francisco in celsius?'
  - 'Tool Call: Name: getWeather'
  - 'Tool Call Output:'
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

- The app sends an input `What is dapr?` to the Ollama LLM component with a structured JSON response format.
- The LLM returns a JSON object with an `answer` field describing Dapr.
- The app sends a weather question with a `getWeather` tool available; the LLM calls the tool and the app executes it.

```text
Input sent: What is dapr?
Output response: { "answer": "Dapr is an open-source, cross-platform microservices framework..." }
Tool calling input sent: What is the weather like in San Francisco in celsius?
Tool Call: Name: getWeather - Arguments: {"location":"San Francisco, CA","unit":"celsius"}
Tool Call Output: The weather in San Francisco, CA is 25 degrees celsius
```

<!-- END_STEP -->

2. Stop and clean up application processes.

```bash
dapr stop -f .
```