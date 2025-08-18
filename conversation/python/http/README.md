# Dapr Conversation API (Python HTTP)

In this quickstart, you'll send an input to a mock Large Language Model (LLM) using Dapr's Conversation API. This API is responsible for providing one consistent API entry point to talk to underlying LLM providers.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/) link for more information about Dapr and the Conversation API.

> **Note:** This example leverages HTTP `requests` only.

This quickstart includes one app:

- `app.py`, responsible for sending an input to the underlying LLM and retrieving an output. It includes a secondary conversation request to showcase tool calling to the underlying LLM.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  

This example uses the default LLM Component provided by Dapr which simply echoes the input provided, for testing purposes. Here are other [supported Conversation components](https://docs.dapr.io/reference/components-reference/supported-conversation/).

1.  Install dependencies:

    <details open="true">
    <summary>Option 2: Using uv (faster modern alternative to pip)</summary>
    
    ```
    cd conversation
    
    python3 -m venv .venv
    source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate
    
    # If you don't have uv installed yet, install it first:
    # pip install uv
    uv pip install -r requirements.txt
    ```
    
    </details>
     
    <details>
    <summary>Option 1: Using classic pip</summary>

    <!-- STEP
    name: Install Python dependencies
    -->

    ```bash
    cd conversation
    
    python3 -m venv .venv
    source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate
    
    pip install -r requirements.txt 
    ```

    <!-- END_STEP -->
    
    </details>
    
    ```bash
    # Return to the parent directory
    cd ..
    ```

2. Open a new terminal window and run the multi app run template:

    <!-- STEP
    name: Run multi app run template
    expected_stdout_lines:
      - '== APP - conversation == Conversation input sent: What is dapr?'
      - '== APP - conversation == Output response: What is dapr?'
      - '== APP - conversation == Tool calling input sent: What is the weather like in San Francisco in celsius?'
      - '== APP - conversation == Output message: What is the weather like in San Francisco in celsius?'
      - '== APP - conversation == Tool calls detected:'
      - '== APP - conversation == Tool call: {'id': '0', 'function': {'name': 'get_weather', 'arguments': 'location,unit'}}'
      - '== APP - conversation == Function name: get_weather'
      - '== APP - conversation == Function arguments: location,unit'   
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
    
    The terminal console output should look similar to this, where:
    
    - The app first sends an input `What is dapr?` to the `echo` Component mock LLM.
    - The mock LLM echoes `What is dapr?`.
    - The app then sends a weather request to the component with tools available to the LLM.
    - The LLM will either respond back with a tool call for the user, or an ask for more information.
    
    ```text
    == APP - conversation == Input sent: What is dapr?
    == APP - conversation == Output response: What is dapr?
    ```
    
    - The app then sends an input `What is the weather like in San Francisco in celsius?` to the `echo` Component mock LLM.
    - The mock LLM echoes `What is the weather like in San Francisco in celsius?` and calls the `get_weather` tool.
    - Since we are using the `echo` Component mock LLM, the tool call is not executed and the LLM returns `No tool calls in response`.
    
    ```text
    == APP == Tool calling input sent: What is the weather like in San Francisco in celsius?
    == APP == Output message: What is the weather like in San Francisco in celsius?
    == APP - conversation == Tool calls detected:
    == APP - conversation == Tool call: {'id': '0', 'function': {'name': 'get_weather', 'arguments': 'location,unit'}}
    == APP - conversation == Function name: get_weather
    == APP - conversation == Function arguments: location,unit
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

1. Install dependencies:

    Open a terminal and run:
    
    ```bash
    cd ./conversation
    ```
    
    <details open="true">
    <summary>Option 1: Using uv (faster alternative to pip)</summary>
    
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate
    # If you don't have uv installed yet, install it first:
    # pip install uv
    uv pip install -r requirements.txt
    ```
   
    </details>
    
    <details>
    <summary>Option 2: Using classic pip</summary>

    ```bash
    python3 -m venv .venv
    source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate
    pip3 install -r requirements.txt
    ```    
    
    </details>

2. Run the application:

    ```bash
    # Make sure your virtual environment is activated
    # If not already activated, run:
    # source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate
    
    dapr run --app-id conversation --resources-path ../../../components -- python3 app.py
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
    == APP - conversation == Tool calls detected:
    == APP - conversation == Tool call: {'id': '0', 'function': {'name': 'get_weather', 'arguments': 'location,unit'}}
    == APP - conversation == Function name: get_weather
    == APP - conversation == Function arguments: location,unit
    ```