using Dapr.Workflow;

namespace ChildWorkflows;

internal sealed class ParentWorkflow : Workflow<string[], string[]>
{
    public override async Task<string[]> RunAsync(WorkflowContext context, string[] input)
    {
         List<Task<string>> childWorkflowTasks = [];
         childWorkflowTasks.AddRange(input.Select(item =>
	         context.CallChildWorkflowAsync<string>(nameof(ChildWorkflow), item)));

         var allChildWorkflowResults = await Task.WhenAll(childWorkflowTasks);
        return allChildWorkflowResults;
    }
}
