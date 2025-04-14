using System;
using Dapr.Workflow;

namespace ResiliencyAndCompensation.Activities;

internal sealed class Division : WorkflowActivity<int, int>
{
    public override Task<int> RunAsync(WorkflowActivityContext context, int divisor)
    {
        // In case the divisor is 0 an DivisionByZeroException is thrown.
        // This exception is handled in the workflow.
        Console.WriteLine($"{nameof(Division)}: Received divisor: {divisor}.");
        var result = Convert.ToInt32(Math.Round(100d / divisor));
        return Task.FromResult(result);
    }
}
