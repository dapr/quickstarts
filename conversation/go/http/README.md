# Dapr Conversation

In this quickstart, you'll send an input to a Large Language Model (LLM) using Dapr's Conversation API. This API is responsible for providing one consistent API entry point to talk to underlying LLM providers.

Visit [this](https://v1-15.docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/) link for more information about Dapr and the Conversation API.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

This quickstart includes one app:

- `conversation.go`, responsible for sending and input to the underlying LLM and retrieving an output.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  

This example uses the Default LLM Component provided by Dapr for testing purposes. Here are other [supported Conversation components](https://v1-15.docs.dapr.io/reference/components-reference/supported-conversation/).

Open a new terminal window and run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - '== APP - conversation == Input sent: What is dapr?'
  - '== APP - conversation == Output response: What is dapr?'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: false
sleep: 5
timeout_seconds: 120
-->

```bash
dapr run -f .
```

The terminal console output should look similar to this, where:

- The app send an input `What is dapr?` to the `echo` LLM.
- The LLM echoes `What is dapr?`.

```text
== APP - conversation == Input sent: What is dapr?
== APP - conversation == Output response: What is dapr?
```

<!-- END_STEP -->