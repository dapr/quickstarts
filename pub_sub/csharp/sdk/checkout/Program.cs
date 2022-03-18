using System;
using Dapr.Client;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

for (int i = 1; i <= 10; i++) {
    var order = new Order(i);
    using var client = new DaprClientBuilder().Build();

    // Publish an event/message using Dapr PubSub
    await client.PublishEventAsync("order_pub_sub", "orders", order);
    Console.WriteLine("Published data: " + order);

    await Task.Delay(TimeSpan.FromSeconds(1));
}

public record Order([property: JsonPropertyName("orderId")] int OrderId);
