using Dapr.Client;
using Dapr.Workflow;

namespace WorkflowApp.Activities;

public class CheckInventory : WorkflowActivity<OrderItem, ActivityResult>
{
    DaprClient _daprClient;

    public CheckInventory(DaprClient daprClient)
    {
        _daprClient = daprClient;
    }

    public override async Task<ActivityResult> RunAsync(WorkflowActivityContext context, OrderItem orderItem)
    {
        Console.WriteLine($"{nameof(CheckInventory)}: Received input: {orderItem}.");

        var productInventory = await _daprClient.GetStateAsync<ProductInventory>(
                Constants.DAPR_INVENTORY_COMPONENT,
                orderItem.ProductId);

        if (productInventory == null)
        {
            return new ActivityResult(IsSuccess: false);
        }

        var isAvailable = productInventory.Quantity >= orderItem.Quantity;
        return new ActivityResult(IsSuccess: isAvailable);
    }
}

public record ActivityResult(bool IsSuccess, string Message = "");
