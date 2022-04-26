using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

var baseURL = (Environment.GetEnvironmentVariable("BASE_URL") ?? "http://localhost") + ":" + (Environment.GetEnvironmentVariable("DAPR_HTTP_PORT") ?? "3500"); //reconfigure cpde to make requests to Dapr sidecar
const string PUBSUBNAME = "orderpubsub";
const string TOPIC = "orders";
Console.WriteLine($"Publishing to baseURL: {baseURL}, Pubsub Name: {PUBSUBNAME}, Topic: {TOPIC} ");

var httpClient = new HttpClient();
httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

for (int i = 1; i <= 10; i++) {
    var order = new Order(i);
    var orderJson = JsonSerializer.Serialize<Order>(order);
    var content = new StringContent(orderJson, Encoding.UTF8, "application/json");

    // Publish an event/message using Dapr PubSub via HTTP Post
    var response = httpClient.PostAsync($"{baseURL}/v1.0/publish/{PUBSUBNAME}/{TOPIC}", content);
    Console.WriteLine("Published data: " + order);

    await Task.Delay(TimeSpan.FromSeconds(1));
}

public record Order([property: JsonPropertyName("orderId")] int OrderId);
