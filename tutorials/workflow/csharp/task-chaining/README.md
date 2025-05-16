# Task Chaining Pattern

This tutorial demonstrates how to chain multiple tasks together as a sequence in a workflow. For more information about the task chaining pattern see the [Dapr docs](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-patterns/#task-chaining).

## Inspect the code

Open the `ChainingWorkflow.cs` file in the `tutorials/workflow/csharp/task-chaining/TaskChaining` folder. This file contains the definition for the workflow.

```mermaid
graph LR
   SW((Start
   Workflow))
   A1[Activity1]
   A2[Activity2]
   A3[Activity3]
   EW((End
   Workflow))
   SW --> A1
   A1 --> A2
   A2 --> A3
   A3 --> EW
```


## Run the tutorial

1. Use a terminal to navigate to the `tutorials/workflow/csharp/task-chaining` folder.
2. Build the project using the .NET CLI.

    ```bash
    dotnet build ./TaskChaining/
    ```

3. Use the Dapr CLI to run the Dapr Multi-App run file

    <!-- STEP
    name: Run multi app run template
    expected_stdout_lines:
    - 'Started Dapr with app id "chaining"'
    expected_stderr_lines:
    working_dir: .
    output_match_mode: substring
    background: true
    sleep: 15
    timeout_seconds: 30
    -->
    ```bash
    dapr run -f .
    ```
    <!-- END_STEP -->

4. Use the POST request in the [`chaining.http`](./chaining.http) file to start the workflow, or use this cURL command:

    ```bash
    curl -i --request POST http://localhost:5255/start
    ```

    The input for the workflow is a string with the value `This`. The expected app logs are as follows:

    ```text
    == APP - chaining == Activity1: Received input: This.
    == APP - chaining == Activity2: Received input: This is.
    == APP - chaining == Activity3: Received input: This is task.
    ```

5. Use the GET request in the [`chaining.http`](./chaining.http) file to get the status of the workflow, or use this cURL command:

    ```bash
    curl --request GET --url http://localhost:3555/v1.0/workflows/dapr/<INSTANCEID>
    ```

    Where `<INSTANCEID>` is the workflow instance ID you received in the `Location` header in the previous step.

    The expected serialized output of the workflow is:

    ```txt
    "\"This is task chaining\""
    ```

6. Stop the Dapr Multi-App run process by pressing `Ctrl+C`.
