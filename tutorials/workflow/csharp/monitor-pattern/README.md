# Monitor Pattern

This tutorial demonstrates how to run a workflow in a loop. This can be used for recurring tasks that need to be executed on a certain frequency (e.g. a clean-up job that runs every hour). For more information on the monitor pattern see the [Dapr docs](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-patterns/#monitor).

## Inspect the code

Open the `MonitorWorkflow.cs` file in the `tutorials/workflow/csharp/monitor-pattern/Monitor` folder. This file contains the definition for the workflow.

```mermaid
graph LR
   SW((Start
   Workflow))
   CHECK[CheckStatus]
   IF{Is Ready}
   TIMER[Wait for a period of time]
   NEW[Continue as a new instance]
   EW((End
   Workflow))
   SW --> CHECK
   CHECK --> IF
   IF -->|Yes| EW
   IF -->|No| TIMER
   TIMER --> NEW
   NEW --> SW
```

## Run the tutorial

1. Use a terminal to navigate to the `tutorials/workflow/csharp/monitor-pattern` folder.
2. Build the project using the .NET CLI.

    ```bash
    dotnet build ./Monitor/
    ```

3. Use the Dapr CLI to run the Dapr Multi-App run file

    <!-- STEP
    name: Run multi app run template
    expected_stdout_lines:
    - 'Started Dapr with app id "monitor"'
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

4. Use the POST request in the [`monitor.http`](./monitor.http) file to start the workflow.

    The input for the workflow is an integer with the value `0`.

5. Use the GET request in the [`monitor.http`](./monitor.http) file to get the status of the workflow.

    The expected serialized output of the workflow is:

    ```txt
    "\"Status is healthy after checking 3 times.\""
    ```

    *The actual number of checks can vary since some randomization is used in the `CheckStatus` activity.*

6. Stop the Dapr Multi-App run process by pressing `Ctrl+C`.
