using Dapr.Client;
using Dapr.Workflow;
using WorkflowApp;
using WorkflowApp.Activities;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<HttpClient>(DaprClient.CreateInvokeHttpClient(appId: "shipping"));
builder.Services.AddSingleton<InventoryManagement>();
builder.Services.AddDaprClient();
builder.Services.AddDaprWorkflow(options =>
{
    options.RegisterWorkflow<OrderWorkflow>();
    options.RegisterActivity<CheckInventory>();
    options.RegisterActivity<CheckShippingDestination>();
    options.RegisterActivity<UpdateInventory>();
    options.RegisterActivity<ProcessPayment>();
    options.RegisterActivity<ReimburseCustomer>();
    options.RegisterActivity<RegisterShipment>();
});
var app = builder.Build();
app.UseCloudEvents();

app.MapPost("/start", async (
    Order order,
    InventoryManagement inventory,
    DaprWorkflowClient workflowClient) =>
{

    // This is to ensure to have enough inventory for the order.
    // So the manual restock endpoint is not needed in this sample.
    await inventory.CreateDefaultInventoryAsync();

    var instanceId = await workflowClient.ScheduleNewWorkflowAsync(
        name: nameof(OrderWorkflow),
        instanceId: order.Id,
        input: order);

    return Results.Accepted(instanceId);
});

// This endpoint handles messages that are published to the shipment-registration-confirmed-events topic.
// It uses the workflow management API to raise an event to the workflow instance to indicate that the 
// shipment has been registered by the ShippingApp.
app.MapPost("/shipmentRegistered", async (
    ShipmentRegistrationStatus status,
    DaprWorkflowClient workflowClient) =>
{
    Console.WriteLine($"Shipment registered for order {status}");

    await workflowClient.RaiseEventAsync(
        instanceId: status.OrderId,
        eventName: Constants.SHIPMENT_REGISTERED_EVENT,
        status);

    return Results.Accepted();
});

// This endpoint is a manual helper method to restock the inventory.
app.MapPost("/inventory/restock", async (
    ProductInventory productInventory,
    DaprClient daprClient
    ) =>
{
    await daprClient.SaveStateAsync(
            Constants.DAPR_INVENTORY_COMPONENT,
            productInventory.ProductId,
            productInventory);

    return Results.Accepted();
});

// This endpoint is a manual helper method to check the inventory.
app.MapGet("/inventory/{productId}", async (
    string productId,
    DaprClient daprClient
    ) =>
{
    var productInventory = await daprClient.GetStateAsync<ProductInventory>(
            Constants.DAPR_INVENTORY_COMPONENT,
            productId);

    if (productInventory == null)
    {
        return Results.NotFound();
    }

    return Results.Ok(productInventory);
});

app.Run();

internal sealed record ProductInventory(string ProductId, int Quantity);
internal sealed record Order(string Id, OrderItem OrderItem, CustomerInfo CustomerInfo);
internal sealed record OrderItem(string ProductId, string ProductName, int Quantity, decimal TotalPrice);
internal sealed record CustomerInfo(string Id, string Country);
internal sealed record ShipmentRegistrationStatus(string OrderId, bool IsSuccess, string Message = "");