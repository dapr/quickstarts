using Dapr.Workflow;
using WorkflowApp.State;

namespace WorkflowApp.Activities;

internal sealed class CheckInventory(IInventoryStore inventoryStore) : WorkflowActivity<OrderItem, ActivityResult>
{
    public override async Task<ActivityResult> RunAsync(WorkflowActivityContext context, OrderItem orderItem)
    {
        Console.WriteLine($"{nameof(CheckInventory)}: Received input: {orderItem}.");

        var productInventory = await inventoryStore.GetStateAsync<ProductInventory>(orderItem.ProductId);

        if (productInventory == null)
            return new ActivityResult(IsSuccess: false);

        var isAvailable = productInventory.Quantity >= orderItem.Quantity;
        return new ActivityResult(IsSuccess: isAvailable);
    }
}

internal sealed record ActivityResult(bool IsSuccess, string Message = "");
