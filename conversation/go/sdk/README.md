# Dapr Conversation API (Go SDK)

In this quickstart, you'll send an input to a mock Large Language Model (LLM) using Dapr's Conversation API. This API is responsible for providing one consistent API entry point to talk to underlying LLM providers.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/) link for more information about Dapr and the Conversation API.

> **Note:** This example leverages the Dapr SDK. If you are looking for the example using the HTTP API [click here](../http/).

This quickstart includes one app:

- `conversation.go`, responsible for sending an input to the underlying LLM and retrieving an output.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  

This example uses the default LLM component (Echo) which simply returns the input for testing purposes. You can switch to the OpenAI component by adding your API token in the provided OpenAI component file and changing the component name from `echo` to `openai`. For other available integrations, see the other [supported conversation components](https://docs.dapr.io/reference/components-reference/supported-conversation/).

Open a new terminal window and run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - '== APP - conversation-sdk == Input sent: What is dapr?'
  - '== APP - conversation-sdk == Output response: What is dapr?'
  - '== APP - conversation-sdk == Tool calling input sent: What is the weather like in San Francisco in celsius?'
  - '== APP - conversation-sdk == Tool Call: Name: getWeather - Arguments: '
  - '== APP - conversation-sdk == Tool Call Output: The weather in San Francisco is 25 degrees Celsius'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: false
sleep: 15
timeout_seconds: 30
-->

```bash
dapr run -f .
```

The terminal console output should look similar to this, where:

- The app sends an input `What is dapr?` to the `echo` Component mock LLM.
- The mock LLM echoes `What is dapr?`.

```text
== APP - conversation-sdk == Input sent: What is dapr?
== APP - conversation-sdk == Output response: What is dapr?
== APP - conversation-sdk == Tool calling input sent: What is the weather like in San Francisco in celsius?
== APP - conversation-sdk == Tool Call: Name: getWeather, Arguments: location,unit
== APP - conversation-sdk == Tool Call Output: The weather in San Francisco is 25 degrees Celsius
```

<!-- END_STEP -->

2. Stop and clean up application processes.

```bash
dapr stop -f .
```