using Dapr.Workflow;

namespace ResiliencyAndCompensation.Activities;

internal sealed class PlusOne : WorkflowActivity<int, int>
{
    public override Task<int> RunAsync(WorkflowActivityContext context, int input)
    {
        Console.WriteLine($"{nameof(PlusOne)}: Received input: {input}.");
        var result = input + 1;
        return Task.FromResult(result);
    }
}
