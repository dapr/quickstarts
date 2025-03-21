using Dapr.Client;
using Dapr.Workflow;
using WorkflowApp;
using WorkflowApp.Activities;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<HttpClient>(DaprClient.CreateInvokeHttpClient(appId: "shipping"));
builder.Services.AddSingleton<InventoryManagement>();
builder.Services.AddDaprClient();
builder.Services.AddDaprWorkflow(options => {
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
    InventoryManagement inventory) => {

    // This is to ensure to have enough inventory for the order.
    await inventory.CreateDefaultInventoryAsync();

    await using var scope  = app.Services.CreateAsyncScope();
    var workflowClient = scope.ServiceProvider.GetRequiredService<DaprWorkflowClient>();

    var instanceId = await workflowClient.ScheduleNewWorkflowAsync(
        name: nameof(OrderWorkflow),
        instanceId: order.Id,
        input: order);

    return Results.Accepted(instanceId);
});

app.MapPost("/shipmentRegistered", async (ShipmentRegistrationStatus status) => {
    await using var scope  = app.Services.CreateAsyncScope();
    var workflowClient = scope.ServiceProvider.GetRequiredService<DaprWorkflowClient>();
    Console.WriteLine($"Shipment registered for order {status}");

    await workflowClient.RaiseEventAsync(
        instanceId: status.OrderId,
        eventName: Constants.SHIPMENT_REGISTERED_EVENT,
        status);

    return Results.Accepted();
});

app.MapPost("/inventory/restock", async (
    ProductInventory productInventory,
    DaprClient daprClient
    ) => {
        await daprClient.SaveStateAsync(
                Constants.DAPR_INVENTORY_COMPONENT,
                productInventory.ProductId,
                productInventory);

        return Results.Accepted();
});

app.MapGet("/inventory/{productId}", async (
    string productId,
    DaprClient daprClient
    ) => {
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

public record ProductInventory(string ProductId, int Quantity);
public record Order(string Id, OrderItem OrderItem, CustomerInfo CustomerInfo);
public record OrderItem(string ProductId, string ProductName, int Quantity, decimal TotalPrice);
public record CustomerInfo(string Id, string Country);
public record ShipmentRegistrationStatus(string OrderId, bool IsSucces, string Message = "");