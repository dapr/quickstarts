using Dapr.Workflow;
using WorkflowManagement.Activities;

namespace WorkflowManagement;

public class NeverEndingWorkflow : Workflow<int, bool>
{
    public override async Task<bool> RunAsync(WorkflowContext context, int counter)
    {
        await context.CallActivityAsync<bool>(
            nameof(SendNotification),
            counter);

        await context.CreateTimer(TimeSpan.FromSeconds(1));
            counter++;
            context.ContinueAsNew(counter);

        return true;
    }
}
