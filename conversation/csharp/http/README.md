# Dapr Conversation API (C# HTTP)

In this quickstart, you'll send an input to a mock Large Language Model (LLM) using Dapr's Conversation API. This API is responsible for providing one consistent API entry point to talk to underlying LLM providers.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/) link for more information about Dapr and the Conversation API.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

This quickstart includes one app:

- Conversation, responsible for sending an input to the underlying LLM and retrieving an output.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template file](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) and Dapr CLI with `dapr run -f .`.  

This example uses the default LLM component (Echo) which simply returns the input for testing purposes. You can switch to the OpenAI component by adding your API token in the provided OpenAI component file and changing the component name from `echo` to `openai`. For other available integrations, see the other [supported conversation components](https://docs.dapr.io/reference/components-reference/supported-conversation/).

Open a new terminal window and run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - '== APP - conversation == Conversation input sent: What is dapr?'
  - '== APP - conversation == Output response: What is dapr?'
  - '== APP - conversation == Tool calling input sent: What is the weather like in San Francisco in celsius?'
  - '== APP - conversation == Output message: What is the weather like in San Francisco in celsius?'
  - '== APP - conversation == Tool calls detected:'
  - "== APP - conversation == Tool call: {\"id\":0,\"function\":{\"name\":\"get_weather\",\"arguments\":"
  - '== APP - conversation == Function name: get_weather'
  - '== APP - conversation == Function arguments: '
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
== APP - conversation == Conversation input sent: What is dapr?
== APP - conversation == Output response: What is dapr?
```

- The app then sends an input `What is the weather like in San Francisco in celsius?` to the `echo` Component mock LLM.
- The mock LLM echoes `What is the weather like in San Francisco in celsius?` and calls the `get_weather` tool.
- The echo Component calls the `get_weather` tool and returns the requested weather information.

```text
== APP - conversation == Tool calling input sent: What is the weather like in San Francisco in celsius?
== APP - conversation == Output message: What is the weather like in San Francisco in celsius?
== APP - conversation == Tool calls detected:
== APP - conversation == Tool call: {"id":0,"function":{"name":"get_weather","arguments":"location,unit"}}
== APP - conversation == Function name: get_weather
== APP - conversation == Function arguments: location,unit
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
dotnet build
```

2. Run the Dapr process alongside the application.

```bash
dapr run --app-id conversation --resources-path ../../../components/ -- dotnet run
```

The terminal console output should look similar to this, where:

- The app sends an input `What is dapr?` to the `echo` Component mock LLM.
- The mock LLM echoes `What is dapr?`.
- The app then sends an input `What is the weather like in San Francisco in celsius?` to the `echo` Component mock LLM.
- The mock LLM echoes `What is the weather like in San Francisco in celsius?` and calls the `get_weather` tool.
- The echo Component calls the `get_weather` tool and returns the requested weather information.

```text
== APP - conversation == Conversation input sent: What is dapr?
== APP - conversation == Output response: What is dapr?
== APP - conversation == Tool calling input sent: What is the weather like in San Francisco in celsius?
== APP - conversation == Output message: What is the weather like in San Francisco in celsius?
== APP - conversation == Tool calls detected:
== APP - conversation == Tool call: {"id":0,"function":{"name":"get_weather","arguments":"location,unit"}}
== APP - conversation == Function name: get_weather
== APP - conversation == Function arguments: location,unit
```
