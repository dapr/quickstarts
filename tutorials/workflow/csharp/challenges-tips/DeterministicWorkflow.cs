using System;
using Dapr.Workflow;

namespace WorkflowApp;

internal sealed class NonDeterministicWorkflow : Workflow<string, string>
{
    public override async Task<string> RunAsync(WorkflowContext context, string orderItem)
    {
        // Do not use non-deterministic operations in a workflow!
        // These operations will create a new value every time the
        // workflow is replayed.
        var orderId = Guid.NewGuid().ToString();
        var orderDate = DateTime.UtcNow;

        var idResult = await context.CallActivityAsync<string>(
            "SubmitId",
            orderId);

        await context.CallActivityAsync<string>(
            "SubmitDate",
            orderDate);

        return idResult;
    }
}

internal sealed class DeterministicWorkflow : Workflow<string, string>
{
    public override async Task<string> RunAsync(WorkflowContext context, string orderItem)
    {
        // Do use these deterministic methods and properties on the WorkflowContext instead.
        // These operations create the same value when the workflow is replayed.
        var orderId = context.NewGuid().ToString();
        var orderDate = context.CurrentUtcDateTime;

        var idResult = await context.CallActivityAsync<string>(
            "SubmitId",
            orderId);

        await context.CallActivityAsync<string>(
            "SubmitDate",
            orderDate);

        return idResult;
    }
}
