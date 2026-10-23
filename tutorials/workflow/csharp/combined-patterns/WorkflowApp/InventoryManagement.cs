using WorkflowApp.State;

namespace WorkflowApp;

internal sealed class InventoryManagement(IInventoryStore inventoryStore)
{
    public async Task CreateDefaultInventoryAsync()
    {
        var productInventoryItem = new ProductInventoryItem("RBD001", "Rubber Duck", 50);

        await inventoryStore.SaveStateAsync(
            productInventoryItem.ProductId,
            productInventoryItem);
    }
}

public record ProductInventoryItem(string ProductId, string ProductName, int Quantity);