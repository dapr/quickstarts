# Workflow Management

This tutorial demonstrates the various APIs to manage a workflow instance, these methods include:

- Scheduling a workflow instance
- Getting the workflow instance state
- Suspending the workflow instance
- Resuming the workflow instance
- Terminating the workflow instance
- Purging the workflow instance

For more information on workflow management, see the [Dapr docs](https://docs.dapr.io/developing-applications/building-blocks/workflow/howto-manage-workflow/).

## Inspect the code

Open the [`WorkflowManagementRestController.java`](src/main/java/io/dapr/springboot/examples/chain/WorkflowManagementRestController.java) file in the `tutorials/workflow/java/workflow-management/` folder. This file contains the endpoint definitions that use the workflow management API. The workflow that is being managed is named `NeverEndingWorkflow` and is a counter that will keep running once it's started.

## Run the tutorial

1. Use a terminal to navigate to the `tutorials/workflow/java/workflow-management` folder.
2. Build and run the project using Maven.

   ```bash
   mvn spring-boot:test-run
   ```

3. Use the first POST request in the [`workflowmanagement.http`](./workflowmanagement.http) file to start the workflow.
4. Use other requests in the [`workflowmanagement.http`](./workflowmanagement.http) file to perform other actions on the workflow, such as:
   - Getting the workflow instance state.
   - Suspending & resuming the workflow instance.
   - Terminating the workflow instance.
   - Purging the workflow instance.
5. Stop the application by pressing `Ctrl+C`.
