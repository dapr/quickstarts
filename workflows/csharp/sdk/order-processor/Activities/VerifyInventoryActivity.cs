namespace WorkflowConsoleApp.Activities;

using System.Threading.Tasks;
using Dapr.Client;
using Dapr.Workflow;
using Microsoft.Extensions.Logging;
using Models;
using System;

internal sealed partial class VerifyInventoryActivity(ILogger<VerifyInventoryActivity> logger, DaprClient daprClient) : WorkflowActivity<InventoryRequest, InventoryResult>
{
    private const string StoreName = "statestore";

    public override async Task<InventoryResult> RunAsync(WorkflowActivityContext context, InventoryRequest req)
    {
        LogVerifyInventory(logger, req.RequestId, req.Quantity, req.ItemName);

        // Ensure that the store has items
        var (orderResult, _) = await daprClient.GetStateAndETagAsync<OrderPayload>(StoreName, req.ItemName);

        // Catch for the case where the statestore isn't setup
        if (orderResult is null)
        {
            // Not enough items.
            LogStateNotFound(logger, req.RequestId, req.ItemName);
            return new InventoryResult(false, null);
        }

        // See if there are enough items to purchase
        if (orderResult.Quantity >= req.Quantity)
        {
            // Simulate slow processing
            await Task.Delay(TimeSpan.FromSeconds(2));

            LogSufficientInventory(logger, orderResult.Quantity, req.ItemName);
            return new InventoryResult(true, orderResult);
        }

        // Not enough items.
        LogInsufficientInventory(logger, req.RequestId, req.ItemName);
        return new InventoryResult(false, orderResult);
    }

    [LoggerMessage(LogLevel.Information, "Reserving inventory for order request ID '{requestId}' of {quantity} {name}")]
    static partial void LogVerifyInventory(ILogger logger, string requestId, int quantity, string name);

    [LoggerMessage(LogLevel.Warning, "Unable to locate an order result for request ID '{requestId}' for the indicated item {itemName} in the state store")]
    static partial void LogStateNotFound(ILogger logger, string requestId, string itemName);

    [LoggerMessage(LogLevel.Information, "There are: {quantity} {name} available for purchase")]
    static partial void LogSufficientInventory(ILogger logger, int quantity, string name);

    [LoggerMessage(LogLevel.Warning, "There is insufficient inventory available for order request ID '{requestId}' for the item {itemName}")]
    static partial void LogInsufficientInventory(ILogger logger, string requestId, string itemName);
}