using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapr.Workflow;
using TaskChaining.Activities;

namespace TaskChaining;

internal sealed class ChainingWorkflow : Workflow<string, string>
{
    public override async Task<string> RunAsync(WorkflowContext context, string input)
    {
        var result1 = await context.CallActivityAsync<string>(
            nameof(Activity1),
            input);
        var result2 = await context.CallActivityAsync<string>(
            nameof(Activity2),
            result1);
        var workflowResult = await context.CallActivityAsync<string>(
            nameof(Activity3),
            result2);

        return workflowResult;
    }
}