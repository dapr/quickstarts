# Versioning Workflows

This tutorial demonstrates how to version your workflows. For more information about workflow versioning in general,
see the 
[Dapr docs](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-features-concepts/#versioning) 
and to learn more about your options using the .NET SDK, refer to the [SDK docs]().

## Inspect the starting workflow

Open the `NotifyUserWorkflow.cs` file. This file contains a workflow that originally sent an email to a user 

but was updated to send the user an SMS message going forward. To effect the
change whenever the workflow runs the next time, a patch is used. This introduces an `if` branch that checks whether
the workflow is currently mid-flight running the workflow or not. If so, the `false` path is taken and the original
workflow intent gets executed. For new workflow instance executions , the `true` path is taken and the updated code path is taken.
workflow intent is taken instead.

## Inspect the new named workflow version

For larger workflow logic changes or if it becomes unwieldy to maintain a collection of patches in your workflow, you can introduce a new 
named workflow version. This gives you the opportunity to refactor your workflow to remove patches and introduce any
additional functionality you might want in your next deployment. Here, because the .NET SDK supports numerical-based
suffix versioning with an optional prefix, here 'V', we introduce a new workflow version named `NotifyUserWorkflowV2`.

It doesn't matter that we didn't have a version suffix on the original workflow because this built-in default strategy 
will automatically assume it to be an earlier version of the workflow version family `NotifyUserWorkflow` and will 
understand that it's superceded by `NotifyUserWorkflowV2`. 

When your application runs, if a workflow is already in flight using `NotifyUserWorkflow`, it will continue to use
your original workflow class, but any new workflow executions will instead route to the new `NotifyUserWorkflowV2` class
instead.

## Running the tutorial
1. Use a terminal to navigate to the `tutorials/workflow/csharp/versioning/Versioning` directory
2. Execute dapr with
```bash
dapr run --app-id wfapp --dapr-grpc-port 50001 --dapr-http-port 3500 --resources-path "../..resources"
```
3. In another terminal, navigate again to the `tutorials/workflow/csharp/versioning/Versioning` directory
4. Run your application with `dotnet run`
5. In a browser, navigate to `http://localhost:5087/start` to start the workflow
6. Close both terminals to close both your application and Dapr.