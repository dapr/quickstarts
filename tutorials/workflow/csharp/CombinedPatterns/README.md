# Combined Workflow Patterns

## Run the tutorial

1. Use a terminal to navigate to the `tutorials/workflow/csharp/CombinedPatterns` folder.
2. Build the projects using the .NET CLI.

    ```bash
    dotnet build /WorkflowApp
    dotnet build /ShippingApp
    ```

3. Use the Dapr CLI to run the Dapr Multi-App run file

    ```bash
    dapr run -f .
    ```

4. Use the POST request in the [`order-workflow.http`](./order-workflow.http) file to start the workflow.
5. Use the GET request in the [`order-workflow.http`](./order-workflow.http) file to get the status of the workflow.
6. Stop the Dapr Multi-App run process by pressing `Ctrl+C`.
