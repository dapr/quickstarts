using System.Text.Json.Serialization;
using Dapr.Messaging;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Dapr reads the subscriptions from YAML and delivers CloudEvents to these routes.
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
