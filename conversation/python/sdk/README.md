# Dapr Conversation API (Python SDK)

This quickstart demonstrates how to interact with Large Language Models (LLMs) using Dapr's Conversation API. The Conversation API provides a unified interface for communicating with various LLM providers through a consistent entry point.

For comprehensive documentation on Dapr's Conversation API, see the [official documentation](https://docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/).

## Sample Applications

This quickstart includes two example applications:

- `app.py`: Basic example that sends a prompt to an LLM and retrieves the response
- `tool_calling.py`: An example that demonstrates how to use the Conversation API to perform external tool calling with two approaches:
    - Creating the tool definition json schema manually
    - Using the `@tool` decorator to automatically generate the schema

## Running the Application

You can run the sample applications using either the Dapr multi-app template or the Dapr CLI directly.

### Use the multi-app-run template file

This approach uses [Dapr's multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) to simplify deployment with `dapr run -f .`.

For more LLM options, see the [supported Conversation components](https://docs.dapr.io/reference/components-reference/supported-conversation/) documentation.

1. **Install dependencies:**

    <!-- STEP
    name: Install Python dependencies
    -->

    ```bash
    uv sync
    ```

    <!-- END_STEP -->

2. **Run the simple Conversation application:**

    <!-- STEP
    name: Run multi app run template
    expected_stdout_lines:
      - 'Input sent: What is dapr?'
      - 'Output response: What is dapr?'
    expected_stderr_lines:
    output_match_mode: substring
    match_order: none
    background: true
    sleep: 15
    timeout_seconds: 30
    -->

    ```bash
    uv run dapr run -f .
    ```

    Expected output:

    ```text
    Input sent: What is dapr?
    Output response: What is dapr?
    ```

    <!-- END_STEP -->

3. **Stop the application:**

    <!-- STEP
    name: Stop multi-app run
    sleep: 5
    -->

    ```bash
    dapr stop -f .
    ```

    <!-- END_STEP -->

4. **Run the tool Calling Conversation application:**

    <!-- STEP
    name: Run multi app run template
    expected_stdout_lines:
      - "Input sent: calculate square root of 15"
      - "Output response: ConversationResultAlpha2Choices(finish_reason='tool_calls', index=0, message=ConversationResultAlpha2Message(content='calculate square root of 15', tool_calls=[ConversationToolCalls(id='0', function=ConversationToolCallsOfFunction(name='calculate', arguments='expression'))]))"
      - "Input sent: get weather in San Francisco in celsius"
      - "Output response: ConversationResultAlpha2Choices(finish_reason='tool_calls', index=0, message=ConversationResultAlpha2Message(content='get weather in San Francisco in celsius', tool_calls=[ConversationToolCalls(id='0', function=ConversationToolCallsOfFunction(name='get_weather', arguments='location,unit'))]))"
    expected_stderr_lines:
    output_match_mode: substring
    match_order: none
    background: true
    sleep: 15
    timeout_seconds: 30
    -->

    ```bash
    uv run dapr run -f dapr-tool-calling.yaml
    ```

    Expected output:

    ```text
    Input sent: calculate square root of 15
    Output response: ConversationResultAlpha2Choices(finish_reason='tool_calls', index=0, message=ConversationResultAlpha2Message(content='calculate square root of 15', tool_calls=[ConversationToolCalls(id='0', function=ConversationToolCallsOfFunction(name='calculate', arguments='expression'))]))
    Input sent: get weather in San Francisco in celsius
    Output response: ConversationResultAlpha2Choices(finish_reason='tool_calls', index=0, message=ConversationResultAlpha2Message(content='get weather in San Francisco in celsius', tool_calls=[ConversationToolCalls(id='0', function=ConversationToolCallsOfFunction(name='get_weather', arguments='location,unit'))]))
    ```

    <!-- END_STEP -->

5. **Stop the tool calling application:**

    <!-- STEP
    name: Stop multi-app run
    sleep: 5
    -->

    ```bash
    dapr stop -f dapr-tool-calling.yaml
    ```

    <!-- END_STEP -->

### Run the apps individually

As an alternative to the multi-app template, you can run the application directly with the Dapr CLI.

1. **Install dependencies:**

    ```bash
    uv sync
    ```

2. **Run the application:**

    ```bash
    cd ./conversation
    dapr run --app-id conversation --resources-path ../../../components -- uv run python app.py
    ```

    Expected output:

    ```text
    Input sent: What is dapr?
    Output response: What is dapr?
    ```

3. **Try the tool calling examples:**

    You can run the other example applications similarly:

    ```bash
    # For tool calling example
    dapr run --app-id conversation --resources-path ../../../components -- uv run python tool_calling.py
    ```
