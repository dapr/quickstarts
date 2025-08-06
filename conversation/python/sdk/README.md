# Dapr Conversation API (Python SDK)

This quickstart demonstrates how to interact with Large Language Models (LLMs) using Dapr's Conversation API. The Conversation API provides a unified interface for communicating with various LLM providers through a consistent entry point.

For comprehensive documentation on Dapr's Conversation API, see the [official documentation](https://docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/).

## Sample Applications

This quickstart includes three example applications:

- `app.py`: Basic example that sends a prompt to an LLM and retrieves the response
- `tool_calling.py`: Advanced example that defines a tool and sends a request to an LLM that supports tool calling
- `tool_calling_from_function.py`: Similar to `tool_calling.py` but uses a helper function to generate the JSON schema for function calling

## LLM Providers

By default, this quickstart uses Dapr's mock LLM Echo Component, which simply echoes back the input for testing purposes.

The repository also includes pre-configured components for the following LLM providers:
- [OpenAI](../../components/openai.yaml)
- [Ollama](../../components/ollama.yaml) (via its OpenAI compatibility layer)

To use one of these alternative provider, modify the `provider_component` value in your application code from `echo` to either `openai` or `ollama`.

Of course, you can also play adding components for other LLM providers supported by Dapr.

### OpenAI Configuration

To use the OpenAI provider:

1. Change the `provider_component` parameter in your application code to `openai`
2. Edit the [openai.yaml](../../components/openai.yaml) component file and replace `YOUR_OPENAI_API_KEY` with your actual OpenAI API key

### Ollama Configuration

To use the Ollama provider:

1. Change the `provider_component` parameter in your application code to `ollama`
2. Install and run Ollama locally on your machine
3. Pull a model with tool-calling support from the [Ollama models repository](https://ollama.com/search?c=tools)

The default configuration uses the `gpt-oss:20b` model, but you can modify the component file to use any compatible model that your system can run.

## Running the Application

You can run the sample applications using either the Dapr multi-app template or the Dapr CLI directly.

### Option 1: Using the Multi-App Template

This approach uses [Dapr's multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) to simplify deployment with `dapr run -f .`.

For more LLM options, see the [supported Conversation components](https://docs.dapr.io/reference/components-reference/supported-conversation/) documentation.

1. **Install dependencies:**

    <!-- STEP
    name: Install Python dependencies
    -->
    
    ```bash
    cd ./conversation
    ```
    
    <details open="true">
    <summary>Option 1: Using pip</summary>
    
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate
    pip3 install -r requirements.txt
    ```
    
    </details>
    
    <details>
    <summary>Option 2: Using uv (faster alternative to pip)</summary>
    
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate
    # If you do not have uv installed yet, install it first:
    # pip install uv
    uv pip install -r requirements.txt
    ```
    
    </details>
    
    ```bash
    # Return to the parent directory
    cd ..
    ```
    <!-- END_STEP -->

2. **Run the application:**

    <!-- STEP
    name: Run multi app run template
    expected_stdout_lines:
      - '== APP - conversation == Input sent: What is dapr?'
      - '== APP - conversation == Output response: What is dapr?'
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
    
    Expected output:
    
    ```text
    == APP - conversation == Input sent: What is dapr?
    == APP - conversation == Output response: What is dapr?
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
    
    # For tool calling with function helper example
    dapr run --app-id conversation --resources-path ../../../components -- python3 tool_calling_from_function.py
    ```
