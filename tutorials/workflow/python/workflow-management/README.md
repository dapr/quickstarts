# Workflow Management

This tutorial demonstrates the various APIs to manage a workflow instance, these methods include:

- Scheduling a workflow instance
- Getting a workflow instance state
- Suspending a workflow instance
- Resuming a workflow instance
- Terminating a workflow instance
- Purging a workflow instance

For more information on workflow management, see the [Dapr docs](https://docs.dapr.io/developing-applications/building-blocks/workflow/howto-manage-workflow/).

## Inspect the code

Open the `app.py` file in the `tutorials/workflow/python/workflow-management/workflow_-_management/workflow_management` folder. This file contains the endpoint definitions that use the workflow management API. The workflow that is being managed is named `never_ending_workflow` and is a counter that will keep running once it's started.

## Run the tutorial

1. Use a terminal to navigate to the `tutorials/workflow/python/workflow-management/workflow-management` folder.
2. Install the dependencies using pip:

    ```bash
    pip3 install -r requirements.txt
    ```

3. Navigate one level back to the `workflow-management` folder and use the Dapr CLI to run the Dapr Multi-App run file

    <!-- STEP
    name: Run multi app run template
    expected_stdout_lines:
    - 'Started Dapr with app id "neverendingworkflow"'
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

4. Use the first POST request in the [`workflowmanagement.http`](./workflowmanagement.http) file to start the workflow.
5. Use other requests in the [`workflowmanagement.http`](./workflowmanagement.http) file to perform other actions on the workflow, such as:
   - Getting the workflow instance state.
   - Suspending & resuming the workflow instance.
   - Terminating the workflow instance.
   - Purging the workflow instance.
6. Stop the Dapr Multi-App run process by pressing `Ctrl+C`.
