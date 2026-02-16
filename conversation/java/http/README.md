# Dapr Conversation API (Java HTTP)

In this quickstart, you'll send an input to a mock Large Language Model (LLM) using Dapr's Conversation API. This API is responsible for providing one consistent API entry point to talk to underlying LLM providers.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/) link for more information about Dapr and the Conversation API.

> **Note:** This example leverages native HTTP client requests only. If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

This quickstart includes one app:

- `ConversationApplication.java`, responsible for sending an input to the underlying LLM and retrieving an output.

## Features Demonstrated

This quickstart demonstrates:

1. **Basic Conversation** - Send a simple message to an LLM and receive a response using the alpha2 API
2. **Tool Calling** - Define tools/functions that the LLM can invoke, following OpenAI's function calling format

### Tool Calling

The conversation API supports advanced tool calling capabilities that allow LLMs to interact with external functions and APIs. This enables you to build sophisticated AI applications that can:

- Execute custom functions based on user requests
- Integrate with external services and databases
- Provide dynamic, context-aware responses

Tool calling follows [OpenAI's function calling format](https://platform.openai.com/docs/guides/function-calling), making it easy to integrate with existing AI development workflows.

## Pre-requisites

* [Dapr and Dapr Cli](https://docs.dapr.io/getting-started/install-dapr-cli/).
* Java JDK 17 (or greater):
  * [Microsoft JDK 17](https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-17)
  * [Oracle JDK 17](https://www.oracle.com/java/technologies/downloads/?er=221886#java17)
  * [OpenJDK 17](https://jdk.java.net/17/)
* [Apache Maven](https://maven.apache.org/install.html) version 3.x.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  

This example uses the default LLM Component provided by Dapr which simply echoes the input provided, for testing purposes. Here are other [supported Conversation components](https://docs.dapr.io/reference/components-reference/supported-conversation/).

### Build and run the Java application

1. Navigate to the `conversation` directory and build the Java application:

<!-- STEP
name: Build Java file
-->

```bash
cd ./conversation
mvn clean install
cd ..
```

<!-- END_STEP -->

2. Run the Java service app with Dapr using the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - '== APP - conversation == === Basic Conversation Example ==='
  - '== APP - conversation == Input sent: What is dapr?'
  - '== APP - conversation == === Tool Calling Example ==='
  - '== APP - conversation == Input sent: What is the weather like in San Francisco?'
  - '== APP - conversation == Tools defined: get_weather (location, unit)'
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

The terminal console output should look similar to this:

```text
== APP - conversation == === Basic Conversation Example ===
== APP - conversation == Input sent: What is dapr?
== APP - conversation == Output response: What is dapr?

== APP - conversation == === Tool Calling Example ===
== APP - conversation == Input sent: What is the weather like in San Francisco?
== APP - conversation == Tools defined: get_weather (location, unit)
== APP - conversation == Note: The echo component echoes input for testing purposes.
== APP - conversation == For actual tool calling, configure a real LLM component like OpenAI.
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

## Run the app with the Dapr CLI

1. Navigate to the `conversation` directory and build the Java application:

```bash
cd ./conversation
mvn clean install
```

2. Run the application with Dapr:

```bash
dapr run --app-id conversation --resources-path ../../../components -- java -jar target/ConversationService-0.0.1-SNAPSHOT.jar
```

You should see the output:

```bash
== APP == === Basic Conversation Example ===
== APP == Input sent: What is dapr?
== APP == Output response: What is dapr?

== APP == === Tool Calling Example ===
== APP == Input sent: What is the weather like in San Francisco?
== APP == Tools defined: get_weather (location, unit)
```

3. Stop the application:

```bash
dapr stop --app-id conversation
```

## Tool Calling with a Real LLM

To use actual tool calling functionality, configure a real LLM component (e.g., OpenAI, Anthropic). Here's an example OpenAI component configuration:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: openai
spec:
  type: conversation.openai
  version: v1
  metadata:
    - name: key
      value: "<your-openai-api-key>"
    - name: model
      value: "gpt-4"
```

Then update `CONVERSATION_COMPONENT_NAME` in the application to use your configured component.

When using a real LLM with tool calling:

1. The LLM analyzes the user request and available tools
2. If a tool is needed, the response includes `finishReason: "tool_calls"` with tool call details
3. Your application executes the tool and gets results
4. Send results back to the LLM using an `ofTool` message to continue the conversation

For more details, see the [Conversation API reference](https://docs.dapr.io/reference/api/conversation_api/).
