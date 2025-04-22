using Dapr.Client;
namespace WorkflowApp;
internal sealed class InventoryManagement(DaprClient daprClient)
{
    public async Task CreateDefaultInventoryAsync()
    {
        var productInventoryItem = new ProductInventoryItem("RBD001", "Rubber Duck", 50);

        await daprClient.SaveStateAsync(
            Constants.DAPR_INVENTORY_COMPONENT,
            productInventoryItem.ProductId,
            productInventoryItem);
    }
}

public record ProductInventoryItem(string ProductId, string ProductName, int Quantity);