namespace WorkflowConsoleApp.Activities;

using System.Threading.Tasks;
using Dapr.Workflow;
using Microsoft.Extensions.Logging;

internal sealed partial class NotifyActivity(ILogger<NotifyActivity> logger) : WorkflowActivity<Notification, object?>
{
    public override Task<object?> RunAsync(WorkflowActivityContext context, Notification notification)
    {
        LogNotification(logger, notification);
        return Task.FromResult<object?>(null);
    }
    
    [LoggerMessage(LogLevel.Information, "Presenting notification {notification}")]
    static partial void LogNotification(ILogger logger, Notification notification);
}

internal sealed record Notification(string Message);