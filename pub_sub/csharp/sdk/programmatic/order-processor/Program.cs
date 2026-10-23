using System.Text.Json.Serialization;
using Dapr.Messaging;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Dapr calls this endpoint at startup to discover subscriptions defined by the app.
app.MapGet("/dapr/subscribe", () => new[]
{
    new { pubsubname = "orderpubsub", topic = "orders-programmatic", route = "/orders" },
    new { pubsubname = "orderpubsub", topic = "orders-bulk-programmatic", route = "/orders-bulk" }
});

app.MapPost("/orders", (CloudEvent<Order> cloudEvent) =>
{
    Console.WriteLine("Subscriber received single order: " + cloudEvent.Data);
    return Results.Ok();
});

app.MapPost("/orders-bulk", (CloudEvent<Order> cloudEvent) =>
{
    Console.WriteLine("Subscriber received bulk-published order: " + cloudEvent.Data);
    return Results.Ok();
});

await app.RunAsync();

public record Order([property: JsonPropertyName("orderId")] int OrderId);
