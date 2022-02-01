using System.Text.Json.Serialization;
using Dapr;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Dapr will send serialized event object vs. being raw CloudEvent
app.UseCloudEvents();

// needed for Dapr pub/sub routing
app.UseRouting();
app.UseEndpoints(endpoints =>{endpoints.MapSubscribeHandler();});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}

// Dapr will send messages/events to route defined in [Topic]
app.MapPost("/orders", [Topic("order_pub_sub", "orders")] (Order order) => {
    Console.WriteLine("Subscriber received : " + order);
    return Results.Ok(order);
});

await app.RunAsync();

app.Run();

public record Order([property: JsonPropertyName("orderid")] int order_id);
public record DaprSubscription(
  [property: JsonPropertyName("pubsubname")] string pubsub_name, 
  [property: JsonPropertyName("topic")] string topic, 
  [property: JsonPropertyName("route")] string route);
