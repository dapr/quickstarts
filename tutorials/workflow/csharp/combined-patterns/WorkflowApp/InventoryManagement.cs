using Dapr.Client;
namespace WorkflowApp;
public class InventoryManagement
{
    private readonly DaprClient _daprClient;

    public InventoryManagement(DaprClient daprClient)
    {
        _daprClient = daprClient;
    }

    public async Task CreateDefaultInventoryAsync()
    {
        var productInventoryItem = new ProductInventoryItem("RBD001", "Rubber Duck", 50);

        await _daprClient.SaveStateAsync(
            Constants.DAPR_INVENTORY_COMPONENT,
            productInventoryItem.ProductId,
            productInventoryItem);
    }
}

public record ProductInventoryItem(string ProductId, string ProductName, int Quantity);