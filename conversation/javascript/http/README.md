# Dapr Conversation API (JS HTTP)

In this quickstart, you'll send an input to a mock Large Language Model (LLM) using Dapr's Conversation API. This API is responsible for providing one consistent API entry point to talk to underlying LLM providers.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/) link for more information about Dapr and the Conversation API.

> **Note:** This example leverages HTTP `requests` only.

This quickstart includes one app:

- `index.js`, responsible for sending an input to the underlying LLM and retrieving an output.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.

This example uses the default LLM Component provided by Dapr which simply echoes the input provided, for testing purposes. Here are other [supported Conversation components](https://docs.dapr.io/reference/components-reference/supported-conversation/).

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
  - '== APP - conversation == Conversation input sent: What is dapr?'
  - '== APP - conversation == Output response: What is dapr?'
  - '== APP - conversation == Tool calling input sent: What is the weather like in San Francisco in celsius?'
  - '== APP - conversation == Output message: What is the weather like in San Francisco in celsius?'
  - '== APP - conversation == No tool calls in response'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 15
timeout_seconds: 30
-->

```bash
dapr run -f .
```

The terminal console output should look similar to this, where:

- The app first sends an input `What is dapr?` to the `echo` Component mock LLM.
- The mock LLM echoes `What is dapr?`.

```text
== APP == Conversation input sent: What is dapr?
== APP == Output response: What is dapr?
```

- The app then sends an input `What is the weather like in San Francisco in celsius?` to the `echo` Component mock LLM.
- The mock LLM echoes `What is the weather like in San Francisco in celsius?` and calls the `get_weather` tool.
- Since we are using the `echo` Component mock LLM, the tool call is not executed and the LLM returns `No tool calls in response`.

```text
== APP == Tool calling input sent: What is the weather like in San Francisco in celsius?
== APP == Output message: What is the weather like in San Francisco in celsius?
== APP == No tool calls in response
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

- The app first sends an input `What is dapr?` to the `echo` Component mock LLM.
- The mock LLM echoes `What is dapr?`.
- The app then sends an input `What is the weather like in San Francisco in celsius?` to the `echo` Component mock LLM.
- The mock LLM echoes `What is the weather like in San Francisco in celsius?`

```text
== APP - conversation == Conversation input sent: What is dapr?
== APP - conversation == Output response: What is dapr?
== APP - conversation == Tool calling input sent: What is the weather like in San Francisco in celsius?
== APP - conversation == Output message: What is the weather like in San Francisco in celsius?
== APP - conversation == No tool calls in response
```
