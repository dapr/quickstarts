using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChildWorkflows.Activities;
using Dapr.Workflow;

namespace ChildWorkflows;
internal sealed class ChildWorkflow : Workflow<string, string>
{
    public override async Task<string> RunAsync(WorkflowContext context, string input)
    {
        var result1 = await context.CallActivityAsync<string>(
            nameof(Activity1),
            input);
        var childWorkflowResult = await context.CallActivityAsync<string>(
            nameof(Activity2),
            result1);

        return childWorkflowResult;
    }
}