# Task Chaining Pattern

This tutorial demonstrates how to chain multiple tasks together as a sequence in a workflow. For more information about the task chaining pattern see the [Dapr docs](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-patterns/#task-chaining).

## Run the tutorial

1. Use a terminal to navigate to the `tutorials/workflow/csharp/task-chaining` folder.
2. Build the project using the .NET CLI.

    ```bash
    dotnet build ./TaskChaining/
    ```

3. Use the Dapr CLI to run the Dapr Multi-App run file

    ```bash
    dapr run -f .
    ```

4. Use the POST request in the [`chaining.http`](./chaining.http) file to start the workflow.
5. Use the GET request in the [`chaining.http`](./chaining.http) file to get the status of the workflow.
6. Stop the Dapr Multi-App run process by pressing `Ctrl+C`.
