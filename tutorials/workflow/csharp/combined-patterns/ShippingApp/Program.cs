using Dapr;
using Dapr.Client;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprClient();
var app = builder.Build();
app.UseCloudEvents();

app.MapPost("/checkDestination", (
    Order order) => {
    Console.WriteLine($"checkDestination: Received input: {order}.");
    var result = new ShippingDestinationResult(IsSuccess: true);
    return Results.Ok(result);
});

app.MapPost("/registerShipment", async (
    Order order,
    DaprClient daprClient) => {
    Console.WriteLine($"registerShipment: Received input: {order}.");
    var status = new ShipmentRegistrationStatus(OrderId: order.Id, IsSuccess: true);

    if (order.Id == string.Empty)
    {
        Console.WriteLine($"Order Id is empty!");
    }
    else
    {
        await daprClient.PublishEventAsync(
            Constants.DAPR_PUBSUB_COMPONENT,
            Constants.DAPR_PUBSUB_CONFIRMED_TOPIC,
            status);
    }

    return Results.Created();
});

app.Run();

public record Order(string Id, OrderItem OrderItem, CustomerInfo CustomerInfo);
public record OrderItem(string ProductId, string ProductName, int Quantity, decimal TotalPrice);
public record CustomerInfo(string Id, string Country);
public record ShipmentRegistrationStatus(string OrderId, bool IsSuccess, string Message = "");
public record ShippingDestinationResult(bool IsSuccess, string Message = "");