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

### Option 1: Using the Multi-App Template

This approach uses [Dapr's multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) to simplify deployment with `dapr run -f .`.

For more LLM options, see the [supported Conversation components](https://docs.dapr.io/reference/components-reference/supported-conversation/) documentation.

1. **Install dependencies:**
    
    ```bash
    cd ./conversation
    ```
    
    <details open="true">
    <summary>Option 1: Using uv (faster modern alternative to pip)</summary>

    ```bash
    python3 -m venv .venv
    source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate
    # If you do not have uv installed yet, install it first:
    # pip install uv
    uv pip install -r requirements.txt
    ```

    </details>
   
    <details>
    <summary>Option 2: Using pip</summary>

    <!-- STEP
    name: Install Python dependencies
    -->
    
    ```bash
    cd conversation   
    python3 -m venv .venv
    source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate
    pip3 install -r requirements.txt
    ```
    
    </details>
    
    ```bash
    # Return to the parent directory
    cd ..
    ```
    <!-- END_STEP -->

2. **Run the simple Conversation application:**

    <!-- STEP
    name: Run multi app run template
    expected_stdout_lines:
      - '== APP - conversation-sdk == Input sent: What is dapr?'
      - '== APP - conversation-sdk == Output response: What is dapr?'
    expected_stderr_lines:
    output_match_mode: substring
    match_order: none
    background: true
    sleep: 15
    timeout_seconds: 30
    -->
    
    ```bash
    source conversation/.venv/bin/activate
    dapr run -f .    
    ```
    
    Expected output:
    
    ```text
    == APP - conversation-sdk == Input sent: What is dapr?
    == APP - conversation-sdk == Output response: What is dapr?
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
      - "== APP - conversation-tool-calling == Input sent: calculate square root of 15"
      - "== APP - conversation-tool-calling == Output response: ConversationResultAlpha2Choices(finish_reason='tool_calls', index=0, message=ConversationResultAlpha2Message(content='calculate square root of 15', tool_calls=[ConversationToolCalls(id='0', function=ConversationToolCallsOfFunction(name='calculate', arguments='expression'))]))"
      - "== APP - conversation-tool-calling == Input sent: get weather in London in celsius"
      - "== APP - conversation-tool-calling == Output response: ConversationResultAlpha2Choices(finish_reason='tool_calls', index=0, message=ConversationResultAlpha2Message(content='get weather in London in celsius', tool_calls=[ConversationToolCalls(id='0', function=ConversationToolCallsOfFunction(name='get_weather', arguments='location,unit'))]))"
    expected_stderr_lines:
    output_match_mode: substring
    match_order: none
    background: true
    sleep: 15
    timeout_seconds: 30
    -->

    ```bash
    source conversation/.venv/bin/activate
    dapr run -f dapr-tool-calling.yaml    
    ```

   Expected output:

    ```text
    == APP - conversation-tool-calling == Input sent: calculate square root of 15
    == APP - conversation-tool-calling == Output response: ConversationResultAlpha2Choices(finish_reason='tool_calls', index=0, message=ConversationResultAlpha2Message(content='calculate square root of 15', tool_calls=[ConversationToolCalls(id='0', function=ConversationToolCallsOfFunction(name='calculate', arguments='expression'))]))
    == APP - conversation-tool-calling == Input sent: get weather in London in celsius
    == APP - conversation-tool-calling == Output response: ConversationResultAlpha2Choices(finish_reason='tool_calls', index=0, message=ConversationResultAlpha2Message(content='get weather in London in celsius', tool_calls=[ConversationToolCalls(id='0', function=ConversationToolCallsOfFunction(name='get_weather', arguments='location,unit'))]))   
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

### Option 2: Using the Dapr CLI Directly

As an alternative to the multi-app template, you can run the application directly with the Dapr CLI.

1. **Install dependencies:**

    ```bash
    cd ./conversation
    python3 -m venv .venv
    source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate
    pip3 install -r requirements.txt
    ```

2. **Run the application:**

    ```bash
    dapr run --app-id conversation --resources-path ../../../components -- python3 app.py
    ```
    
    Expected output:
    
    ```text
    == APP == Input sent: What is dapr?
    == APP == Output response: What is dapr?
    ```
    
3. **Try the tool calling examples:**

    You can run the other example applications similarly:
    
    ```bash
    # For tool calling example
    dapr run --app-id conversation --resources-path ../../../components -- python3 tool_calling.py
    ```
