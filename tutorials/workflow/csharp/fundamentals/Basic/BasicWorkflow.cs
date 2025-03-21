using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapr.Workflow;
using Basic.Activities;

namespace Basic;

public class BasicWorkflow : Workflow<string, string>
{
    public override async Task<string> RunAsync(WorkflowContext context, string input)
    {
        var result1 = await context.CallActivityAsync<string>(
            nameof(Activity1),
            input);

        var result2 = await context.CallActivityAsync<string>(
            nameof(Activity2),
            result1);

        return result2;
    }
}