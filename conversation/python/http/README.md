# Dapr Conversation API (Python HTTP)

In this quickstart, you'll send an input to a mock Large Language Model (LLM) using Dapr's Conversation API. This API is responsible for providing one consistent API entry point to talk to underlying LLM providers.

Visit [this](https://v1-15.docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/) link for more information about Dapr and the Conversation API.

> **Note:** This example leverages HTTP `requests` only.

This quickstart includes one app:

- `app.py`, responsible for sending an input to the underlying LLM and retrieving an output.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  

This example uses the default LLM Component provided by Dapr which simply echoes the input provided, for testing purposes. Here are other [supported Conversation components](https://v1-15.docs.dapr.io/reference/components-reference/supported-conversation/).

1. Install dependencies:

<!-- STEP
name: Install Python dependencies
-->

```bash
cd ./conversation
pip3 install -r requirements.txt
cd ..
```

2. Open a new terminal window and run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - '== APP == INFO:root:Input sent: What is dapr?'
  - '== APP == INFO:root:Output response: What is dapr?'
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

- The app sends an input `What is dapr?` to the `echo` Component mock LLM.
- The mock LLM echoes `What is dapr?`.

```text
== APP - conversation == Input sent: What is dapr?
== APP - conversation == Output response: What is dapr?
```

<!-- END_STEP -->

2. Stop and clean up application processes.

<!-- STEP
name: Stop multi-app run 
sleep: 5
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->

## Run the app with the Dapr CLI

1. Install dependencies:

Open a terminal and run:

```bash
cd ./conversation
pip3 install -r requirements.txt
```

2. Run the application:

```bash
dapr run --app-id conversation --resources-path ../../../components -- python3 app.py
```

You should see the output:

```bash
== APP == INFO:root:Input sent: What is dapr?
== APP == INFO:root:Output response: What is dapr?
```
