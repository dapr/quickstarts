namespace WorkflowConsoleApp.Activities;

using System.Threading.Tasks;
using Dapr.Client;
using Dapr.Workflow;
using Microsoft.Extensions.Logging;
using Models;
using System;

internal sealed partial class ProcessPaymentActivity(ILogger<ProcessPaymentActivity> logger) : WorkflowActivity<PaymentRequest, object?>
{
    public override async Task<object?> RunAsync(WorkflowActivityContext context, PaymentRequest req)
    {
        LogPaymentProcessing(logger, req.RequestId, req.Amount, req.ItemBeingPurchased, req.Currency);

        // Simulate slow processing
        await Task.Delay(TimeSpan.FromSeconds(7));

        LogSuccessfulPayment(logger, req.RequestId);
        return null;
    }

    [LoggerMessage(LogLevel.Information, "Processing payment: request ID '{requestId}' for {amount} {itemBeingPurchased} at ${currency}")]
    static partial void LogPaymentProcessing(ILogger logger, string requestId, int amount, string itemBeingPurchased, double currency);

    [LoggerMessage(LogLevel.Information, "Payment for request ID '{requestId}' processed successfully")]
    static partial void LogSuccessfulPayment(ILogger logger, string requestId);
}