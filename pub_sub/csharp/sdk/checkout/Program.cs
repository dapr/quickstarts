using System;
using Dapr.Client;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

while(true) {
    Random random = new Random();
    var order = new Order(random.Next(1,1000));
    using var client = new DaprClientBuilder().Build();

    // Publish an event/message using Dapr PubSub
    await client.PublishEventAsync("order_pub_sub", "orders", order);
    Console.WriteLine("Published data: " + order);

    await Task.Delay(TimeSpan.FromSeconds(1));
}

public record Order([property: JsonPropertyName("orderId")] int OrderId);
