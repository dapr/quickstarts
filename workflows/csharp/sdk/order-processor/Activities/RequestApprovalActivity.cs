namespace WorkflowConsoleApp.Activities;

using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Dapr.Workflow;
using WorkflowConsoleApp.Models;

internal sealed partial class RequestApprovalActivity(ILogger<RequestApprovalActivity> logger) : WorkflowActivity<ApprovalRequest, object?>
{
    public override async Task<object?> RunAsync(WorkflowActivityContext context, ApprovalRequest approvalRequest)
    {
        // Simulate slow processing & sending the approval to the recipient
        await Task.Delay(TimeSpan.FromSeconds(2));

        LogRequestApproval(logger, approvalRequest.RequestId);

        return Task.FromResult<object?>(null);
    }
    
    [LoggerMessage(LogLevel.Information, "Approval requested for order {orderId}. Waiting for approval.")]
    static partial void LogRequestApproval(ILogger logger, string orderId);
}