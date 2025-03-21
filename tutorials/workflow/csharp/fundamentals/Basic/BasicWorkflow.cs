using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapr.Workflow;
using Basic.Activities;

namespace Basic;

/// <summary>
/// Workflows inherit from the abstract Workflow class from the Dapr.Workflow namespace.
/// The first generic parameter is the input type of the workflow, and the second parameter is the output type.
/// </summary>
public class BasicWorkflow : Workflow<string, string>
{
    /// <summary>
    /// The RunAsync method is an abstract method in the abstract Workflow class that needs to be implemented.
    /// This method is the entry point for the workflow.
    /// </summary>
    /// <param name="context">The WorkflowContext provides properties about the workflow instance.
    /// It also contains methods to call activities, child workflows, wait for external events, start timers, and continue as a new instance.</param>
    /// <param name="input">The input parameter for the workflow. There can only be one input parameter. Use a record or class if multiple input values are required.</param>
    /// <returns>The return value of the workflow. It can be a simple or complex type. In case a workflow doesn't require an output, you can specify a nullable object since a return type is mandatory.</returns>
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