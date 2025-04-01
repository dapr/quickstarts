using Dapr.Client;
using Dapr.Workflow;

namespace WorkflowApp.Activities;

internal sealed class UpdateInventory : WorkflowActivity<OrderItem, UpdateInventoryResult>
{
    DaprClient _daprClient;

    public UpdateInventory(DaprClient daprClient)
    {
        _daprClient = daprClient;
    }

    public override async Task<UpdateInventoryResult> RunAsync(WorkflowActivityContext context, OrderItem orderItem)
    {
        Console.WriteLine($"{nameof(UpdateInventory)}: Received input: {orderItem}.");

        var productInventory = await _daprClient.GetStateAsync<ProductInventory>(
                Constants.DAPR_INVENTORY_COMPONENT,
                orderItem.ProductId);

        if (productInventory == null)
        {
            return new UpdateInventoryResult(IsSuccess: false, Message: $"Product not in inventory: {orderItem.ProductName}");
        }

        if (productInventory.Quantity < orderItem.Quantity)
        {
            return new UpdateInventoryResult(IsSuccess: false, Message: $"Inventory not sufficient for: {orderItem.ProductName}");
        }

        var updatedInventory = new ProductInventory(
            productInventory.ProductId,
            productInventory.Quantity - orderItem.Quantity);

        await _daprClient.SaveStateAsync(
            Constants.DAPR_INVENTORY_COMPONENT,
            productInventory.ProductId,
            updatedInventory);

        return new UpdateInventoryResult(IsSuccess: true, Message: $"Inventory updated for {orderItem.ProductName}");
    }
}

internal sealed record UpdateInventoryResult(bool IsSuccess, string Message = "");
