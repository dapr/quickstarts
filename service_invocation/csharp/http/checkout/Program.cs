using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

var baseURL = (Environment.GetEnvironmentVariable("BASE_URL") ?? "http://localhost") + ":" + (Environment.GetEnvironmentVariable("DAPR_HTTP_PORT") ?? "3500");

var client = new HttpClient();
client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
// Adding app id as part of the header
client.DefaultRequestHeaders.Add("dapr-app-id", "order-processor");

for (int i = 1; i <= 10; i++) {
    var order = new Order(i);
    var orderJson = JsonSerializer.Serialize<Order>(order);
    var content = new StringContent(orderJson, Encoding.UTF8, "application/json");

    // Invoking a service
    var response = await client.PostAsync($"{baseURL}/orders", content);
    Console.WriteLine("Order passed: " + order);

    await Task.Delay(TimeSpan.FromSeconds(1));
}

public record Order([property: JsonPropertyName("orderId")] int OrderId);
