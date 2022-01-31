using System.Text;
using System.Text.Json;
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
    var subscriptions = "[{'pubsubname': 'order_pub_sub', 'topic': 'orders', 'route': 'orders'}]";
    return subscriptions;
});

app.MapPost("/orders", async (Order order) => {
    Console.WriteLine("Subscriber received : " + order.ToString());
    return new HttpResponseMessage(HttpStatusCode.OK);
});

        // [Topic("order_pub_sub", "orders")]
        // [HttpPost("order-processor")]
        // public HttpResponseMessage getCheckout([FromBody] int orderId)
        // {
        //     Console.WriteLine("Subscriber received : " + orderId);
        //     return new HttpResponseMessage(HttpStatusCode.OK);
        // }

await app.RunAsync();

app.Run();

public record Order([property: JsonPropertyName("orderid")] int order_id);
