using System.Text.Json.Serialization;
using Dapr;

var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

// Dapr will send serialized event object vs. being raw CloudEvent
app.UseCloudEvents();

// needed for Dapr pub/sub routing
app.MapSubscribeHandler();

if (app.Environment.IsDevelopment()) {app.UseDeveloperExceptionPage();}

// Dapr subscription in [Topic] routes orders topic to this route
app.MapPost("/orders", [Topic("orderpubsub", "orders")] (Order order) => {
    Console.WriteLine("Subscriber received : " + order);
    return Results.Ok(order);
});

await app.RunAsync();

public record Order([property: JsonPropertyName("orderId")] int OrderId);
