# Workflow Basics

This tutorial covers the fundamentals of authoring Dapr Workflows. For more information about the fundamentals of Dapr Workflows, see the [Dapr docs](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-features-concepts/).

## Run the tutorial

1. Use a terminal to navigate to the `tutorials/workflow/csharp/fundamentals` folder.
2. Build the project using the .NET CLI.

    ```bash
    dotnet build ./Basic/
    ```

3. Use the Dapr CLI to run the Dapr Multi-App run file

    ```bash
    dapr run -f .
    ```

4. Use the POST request in the [`basics.http`](./basics.http) file to start the workflow.
5. Use the GET request in the [`basics.http`](./basics.http) file to get the status of the workflow.
6. Stop the Dapr Multi-App run process by pressing `Ctrl+C`.
