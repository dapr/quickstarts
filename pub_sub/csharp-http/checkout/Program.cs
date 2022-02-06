using System;
using Dapr.Client;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Net.Http;

var httpClient = new HttpClient();

while(true) {
    Random random = new Random();
    var order = new Order(random.Next(1,1000));
    using var client = new DaprClientBuilder().Build();

    //Publish a message using Dapr pub/sub
    await client.PublishEventAsync("order_pub_sub", "orders", order);
    Console.WriteLine("Published data: " + order);

    await Task.Delay(TimeSpan.FromSeconds(1));
}

public record Order([property: JsonPropertyName("orderId")] int OrderId);
