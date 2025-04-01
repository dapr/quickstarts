using Dapr.Workflow;

namespace ExternalEvents.Activities;

internal sealed class SendNotification : WorkflowActivity<string, bool>
{
    public override Task<bool> RunAsync(WorkflowActivityContext context, string message)
    {
        Console.WriteLine($"{nameof(SendNotification)}: {message}.");
        // Imagine a notification being sent to the user
        return Task.FromResult(true);
    }
}
