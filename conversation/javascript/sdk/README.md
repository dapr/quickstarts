# Dapr Conversation API (JS SDK)

In this quickstart, you'll send an input to a Large Language Model (LLM) using Dapr's Conversation API. This API is responsible for providing one consistent API entry point to talk to underlying LLM providers.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/) link for more information about Dapr and the Conversation API.

> **Note:** This example uses the Dapr JavaScript SDK, pinned to `3.19.0`. For the HTTP-only version, see [this example](../http/README.md).

This quickstart includes one app:

- `index.js`, responsible for sending an input to the underlying LLM and retrieving an output.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.

Use Node.js 22 or later and an initialized Dapr 1.19 runtime. This example uses the Ollama LLM component for local inference. Before running it, install and start [Ollama](https://ollama.com/) and pull the model configured in the shared component:

```bash
ollama pull llama3.2:latest
```

You can switch to the OpenAI component by adding your API token in the provided OpenAI component file and changing `conversationComponentName` from `ollama` to `openai` in `index.js`. For other available integrations, see the other [supported conversation components](https://docs.dapr.io/reference/components-reference/supported-conversation/).

1. Install dependencies:

<!-- STEP
name: Install Node dependencies for conversation
-->

```bash
cd ./conversation
npm install
```

<!-- END_STEP -->

2. Open a new terminal window in this `sdk` directory and run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Conversation input sent: What is dapr?'
  - 'Usage: prompt_tokens='
  - 'Output response:'
  - 'Tool calling input sent: What is the weather like in San Francisco in celsius?'
  - 'Tool calls detected:'
  - 'Function: get_weather'
  - 'Arguments:'
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

- The app first sends an input `What is dapr?` to the Ollama LLM component using `client.conversation.converse`, with a structured JSON response format and a one-day prompt cache retention hint.
- The LLM returns a JSON object with an `answer` field describing Dapr. The app checks that this field is a nonempty string.
- The app then sends a weather request with a `get_weather` tool available and `toolChoice: "required"`; the LLM returns a tool call.

```text
Conversation input sent: What is dapr?
Usage: prompt_tokens=30 completion_tokens=64 total_tokens=94
Output response: { "answer": "Dapr is an open-source, cross-platform microservices framework..." }
Tool calling input sent: What is the weather like in San Francisco in celsius?
Tool calls detected:
  Function: get_weather
  Arguments: {"location":"San Francisco, CA","unit":"celsius"}
```

<!-- END_STEP -->

The answer, token counts, and tool arguments vary by model and run. The SDK uses `responseFormat` for the JSON schema and `Temporal.Duration` for `promptCacheRetention`; support for these options depends on the provider. This sample prints tool calls but does not execute them or retrieve real weather. Applications must validate model-generated tool names and arguments before executing tools.

3. Stop and clean up application processes.

<!-- STEP
name: Stop multi-app run
sleep: 5
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->

## Run the app individually

1. Open a terminal in this `sdk` directory and navigate to the `conversation` app. Install the dependencies if you haven't already.

```bash
cd ./conversation
npm install
```

2. Run the Dapr process alongside the application.

```bash
dapr run --app-id conversation-sdk --resources-path ../../../components/ -- npm run start
```

The app sends the same structured-response and tool-calling requests as the multi-app template. The terminal console output should look similar to this:

```text
Conversation input sent: What is dapr?
Usage: prompt_tokens=30 completion_tokens=64 total_tokens=94
Output response: { "answer": "Dapr is an open-source, cross-platform microservices framework..." }
Tool calling input sent: What is the weather like in San Francisco in celsius?
Tool calls detected:
  Function: get_weather
  Arguments: {"location":"San Francisco, CA","unit":"celsius"}
```
