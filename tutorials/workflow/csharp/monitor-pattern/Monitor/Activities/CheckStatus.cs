using Dapr.Workflow;

namespace Monitor.Activities;

public class CheckStatus : WorkflowActivity<int, Status>
{
    public override Task<Status> RunAsync(WorkflowActivityContext context, int input)
    {
        Console.WriteLine($"{nameof(CheckStatus)}: Received input: {input}.");
        var random = new Random();
        var isReady = random.Next(0, input) > 1 ? true : false;
        return Task.FromResult(new Status(isReady));
    }
}

public record Status(bool IsReady);
