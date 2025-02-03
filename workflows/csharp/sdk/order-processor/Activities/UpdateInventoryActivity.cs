namespace WorkflowConsoleApp.Activities;

using System.Threading.Tasks;
using Dapr.Client;
using Dapr.Workflow;
using Models;
using Microsoft.Extensions.Logging;
using System;

internal sealed partial class UpdateInventoryActivity(ILogger<UpdateInventoryActivity> logger, DaprClient daprClient) : WorkflowActivity<PaymentRequest, object?>
{
    private const string StoreName = "statestore";

    public override async Task<object?> RunAsync(WorkflowActivityContext context, PaymentRequest req)
    {
        LogCheckingInventory(logger, req.RequestId, req.ItemBeingPurchased, req.Amount);

        // Simulate slow processing
        await Task.Delay(TimeSpan.FromSeconds(5));

        // Determine if there are enough Items for purchase
        var (original, _) = await daprClient.GetStateAndETagAsync<OrderPayload>(StoreName, req.ItemBeingPurchased);
        var newQuantity = original.Quantity - req.Amount;
            
        if (newQuantity < 0)
        {
            LogInsufficientInventory(logger, req.RequestId);
            throw new InvalidOperationException();
        }

        // Update the statestore with the new amount of paper clips
        await daprClient.SaveStateAsync(StoreName, req.ItemBeingPurchased,  new OrderPayload(Name: req.ItemBeingPurchased, TotalCost: req.Currency, Quantity: newQuantity));
        LogUpdatedInventory(logger, newQuantity, original.Name);

        return null;
    }

    [LoggerMessage(LogLevel.Information, "Checking inventory for request ID '{requestId}' for {quantity} {item}")]
    static partial void LogCheckingInventory(ILogger logger, string requestId, string item, int quantity);

    [LoggerMessage(LogLevel.Warning, "Payment for request ID '{requestId}' could not be processed as there's insufficient inventory available")]
    static partial void LogInsufficientInventory(ILogger logger, string requestId);

    [LoggerMessage(LogLevel.Information, "There are now {newQuantity} {itemName} left in stock")]
    static partial void LogUpdatedInventory(ILogger logger, int newQuantity, string itemName);
}