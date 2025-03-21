# Workflow Management

This tutorial demonstrates the various APIs to manage a workflow instance, these methods include:

- Scheduling a workflow instance
- Getting the workflow instance state
- Suspending the workflow instance
- Resuming the workflow instance
- Terminating the workflow instance
- Purging the workflow instance

For more information on workflow management, see the [Dapr docs](https://docs.dapr.io/developing-applications/building-blocks/workflow/howto-manage-workflow/).

## Run the tutorial

1. Use a terminal to navigate to the `tutorials/workflow/csharp/WorkflowManagement` folder.
2. Build the project using the .NET CLI.

    ```bash
    dotnet build
    ```

3. Use the Dapr CLI to run the Dapr Multi-App run file

    ```bash
    dapr run -f .
    ```

4. Use the first POST request in the [`workflowmanagement.http`](./workflowmanagement.http) file to start the workflow.
5. Use other requests in the [`workflowmanagement.http`](./workflowmanagement.http) file to perform other actions on the workflow, such as:
   - Getting the workflow instance state.
   - Suspending & resuming the workflow instance.
   - Terminating the workflow instance.
   - Purging the workflow instance.
6. Stop the Dapr Multi-App run process by pressing `Ctrl+C`.
