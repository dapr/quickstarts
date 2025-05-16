using Dapr.Workflow;

namespace Basic.Activities;

internal sealed class Activity2 : WorkflowActivity<string, string>
{
    public override Task<string> RunAsync(WorkflowActivityContext context, string input)
    {
        Console.WriteLine($"{nameof(Activity2)}: Received input: {input}.");
        return Task.FromResult($"{input} Three" );
    }
}
