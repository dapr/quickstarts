# Resiliency & Compensation

This tutorial demonstrates how to improve resiliency when activities are executed and how to include compensation actions when activities return an error. For more on workflow resiliency read the [Dapr docs](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-features-concepts/#retry-policies).

## Inspect the code

Open the `ResiliencyAndCompensationWorkflow.cs` file in the `tutorials/workflow/csharp/resiliency-and-compensation/ResiliencyAndCompensation` folder. This file contains the definition for the workflow. This workflow implements an activity retry policy on all the associated activities and compensating logic if an activity throws an exception.

```mermaid
graph LR
   SW((Start
   Workflow))
   A1[MinusOne]
   A2[Division]
   EX{Division
   Exception?}
   A3[PlusOne]
   EW((End
   Workflow))
   SW --> A1
   A1 --> A2
   A2 --> EX
   EX -- yes --> A3
   EX -- no --> EW
   A3 --> EW
```

## Run the tutorial

1. Use a terminal to navigate to the `tutorials/workflow/csharp/resiliency-and-compensation` folder.
2. Build the project using the .NET CLI.

    ```bash
    dotnet build ./ResiliencyAndCompensation/
    ```

3. Use the Dapr CLI to run the Dapr Multi-App run file

    <!-- STEP
    name: Run multi app run template
    expected_stdout_lines:
    - 'Started Dapr with app id "resiliency"'
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

4. Use the POST request in the [`resiliency-compensation.http`](./resiliency-compensation.http) file to start the workflow with a workflow input value of `1`.

    When the workflow input is `1`, the `MinusOne` activity will subtract `1` resulting in a `0`. This value is passed to the `Division` activity, which will throw an error because the divisor is `0`. The `Division` activity will be retried three times but all will fail the same way as the divisor has not changed. Finally the compensation action `PlusOne` will be executed, increasing the value back to `1` before returning the result.
    
    The app logs should output the following:

    ```txt
    == APP - resiliency == MinusOne: Received input: 1.
    == APP - resiliency == Division: Received divisor: 0.
    == APP - resiliency == Division: Received divisor: 0.
    == APP - resiliency == Division: Received divisor: 0.
    == APP - resiliency == PlusOne: Received input: 0.
    ```

5. Use the GET request in the [`resiliency-compensation.http`](./resiliency-compensation.http) file to get the status of the workflow.

    Then `1` is used as the input, the expected serialized output of the workflow is:

    ```txt
    "1"
    ```

6. Stop the Dapr Multi-App run process by pressing `Ctrl+C`.
