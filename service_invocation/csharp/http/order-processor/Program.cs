var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

if (app.Environment.IsDevelopment()) 
{
    app.UseDeveloperExceptionPage();
}

app.MapPost("/orders", async (Order order) 
{
    Console.WriteLine("Order received : " + order);
    return order.ToString();
});

await app.RunAsync();

public record Order([property: JsonPropertyName("orderId")] int orderId); 
