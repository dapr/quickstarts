using Dapr.Workflow;

namespace WorkflowManagement.Activities;

public class SendNotification : WorkflowActivity<int, bool>
{
    public override Task<bool> RunAsync(WorkflowActivityContext context, int counter)
    {
        Console.WriteLine($"{nameof(SendNotification)}: Received input: {counter}.");
        // Imagine that a notification is sent to the user here.
        return Task.FromResult(true);
    }
}

public record Notification(string UserId, string Message);