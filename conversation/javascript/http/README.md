# Dapr Conversation API (JS HTTP)

In this quickstart, you'll send an input to a mock Large Language Model (LLM) using Dapr's Conversation API. This API is responsible for providing one consistent API entry point to talk to underlying LLM providers.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/) link for more information about Dapr and the Conversation API.

> **Note:** This example leverages HTTP `requests` only.

This quickstart includes one app:

- `index.js`, responsible for sending an input to the underlying LLM and retrieving an output.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.

This example uses the Ollama LLM component for local inference. You can switch to the OpenAI component by adding your API token in the provided OpenAI component file and changing the component name from `ollama` to `openai`. For other available integrations, see the other [supported conversation components](https://docs.dapr.io/reference/components-reference/supported-conversation/).

1. Install dependencies:

<!-- STEP
name: Install Node dependencies for conversation
-->

```bash
cd ./conversation
npm install
```

<!-- END_STEP -->

2. Open a new terminal window and run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Conversation input sent: What is dapr?'
  - 'Usage:'
  - 'Output response:'
  - 'Tool calling input sent: What is the weather like in San Francisco in celsius?'
  - 'Tool calls'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: false
sleep: 30
timeout_seconds: 120
-->

```bash
dapr run -f .
```

The terminal console output should look similar to this, where:

- The app first sends an input `What is dapr?` to the Ollama LLM component with a structured JSON response format.
- The LLM returns a JSON object with an `answer` field describing Dapr.
- The app then sends a weather request with a `get_weather` tool available; the LLM calls the tool.

```text
Conversation input sent: What is dapr?
Usage: prompt_tokens=30 completion_tokens=64 total_tokens=94
Output response: { "answer": "Dapr is an open-source, cross-platform microservices framework..." }
Tool calling input sent: What is the weather like in San Francisco in celsius?
Tool calls detected: [{"id":"call_xxxx","function":{"name":"get_weather","arguments":"{\"location\":\"San Francisco, CA\",\"unit\":\"celsius\"}"}}]
```

<!-- END_STEP -->

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

1. Open a terminal and navigate to the `conversation` app. Install the dependencies if you haven't already.

```bash
cd ./conversation
npm install
```

2. Run the Dapr process alongside the application.

```bash
dapr run --app-id conversation --resources-path ../../../components/ -- npm run start
```

The terminal console output should look similar to this, where:

- The app first sends an input `What is dapr?` to the Ollama LLM component with a structured JSON response format.
- The LLM returns a JSON object with an `answer` field describing Dapr.
- The app then sends a weather request with a `get_weather` tool available; the LLM calls the tool.

```text
Conversation input sent: What is dapr?
Usage: prompt_tokens=30 completion_tokens=64 total_tokens=94
Output response: { "answer": "Dapr is an open-source, cross-platform microservices framework..." }
Tool calling input sent: What is the weather like in San Francisco in celsius?
Tool calls detected: [{"id":"call_xxxx","function":{"name":"get_weather","arguments":"{\"location\":\"San Francisco, CA\",\"unit\":\"celsius\"}"}}]
```
