using Dapr.Workflow;

namespace WorkflowApp;

/// <summary>
/// This is the initial version of the workflow.
/// Note that the input argument for both activities is the orderItem (string).
/// </summary>
internal sealed class VersioningWorkflow1 : Workflow<string, int>
{
    public override async Task<int> RunAsync(WorkflowContext context, string orderItem)
    {
        int resultA = await context.CallActivityAsync<int>(
            "ActivityA",
            orderItem);

        int resultB = await context.CallActivityAsync<int>(
            "ActivityB",
            orderItem);

        return resultA + resultB;
    }
}

/// <summary>
/// This is the updated version of the workflow.
/// The input for ActivityB has changed from orderItem (string) to resultA (int).
/// If there are in-flight workflow instances that were started with the previous version
/// of this workflow, these will fail when the new version of the workflow is deployed 
/// and the workflow name remains the same, since the runtime parameters do not match with the persisted state.
/// It is recommended to version workflows by creating a new workflow class with a new name:
/// {workflowname}1 -> {workflowname}2
/// </summary>
internal sealed class VersioningWorkflow2 : Workflow<string, int>
{
    public override async Task<int> RunAsync(WorkflowContext context, string orderItem)
    {
        int resultA = await context.CallActivityAsync<int>(
            "ActivityA",
            orderItem);

        int resultB = await context.CallActivityAsync<int>(
            "ActivityB",
            resultA);

        return resultA + resultB;
    }
}