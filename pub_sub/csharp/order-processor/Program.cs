using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}

app.MapGet("/dapr/subscribe", () => {
    var sub = new DaprSubscription(pubsub_name: "order_pub_sub", topic: "orders", route: "orders");
    Console.WriteLine("Dapr pub/sub is subscribed to: " + sub);
    return Results.Json(new DaprSubscription[]{sub});
});

app.MapPost("/orders", (DaprData<Order> request_data) => {
    Console.WriteLine("Subscriber received : " + request_data.data.order_id);
    return Results.Ok(request_data.data.order_id);
});

await app.RunAsync();

app.Run();

public record DaprData<T> ([property: JsonPropertyName("data")] T data); 
public record Order([property: JsonPropertyName("orderid")] int order_id);
public record DaprSubscription(
  [property: JsonPropertyName("pubsubname")] string pubsub_name, 
  [property: JsonPropertyName("topic")] string topic, 
  [property: JsonPropertyName("route")] string route);
