using System;
using Dapr.Client;
using System.Threading;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;


while(true) {
    Random random = new Random();
    var order = new Order(random.Next(1,1000));
    var data = JsonSerializer.Serialize<Order>(order);
    CancellationTokenSource source = new CancellationTokenSource();
    CancellationToken cancellationToken = source.Token;
    using var client = new DaprClientBuilder().Build();
    await client.PublishEventAsync("order_pub_sub", "orders", data, cancellationToken);
    Console.WriteLine("Published data: " + data);
    System.Threading.Thread.Sleep(1000);
}

public record Order([property: JsonPropertyName("orderid")] int order_id);
