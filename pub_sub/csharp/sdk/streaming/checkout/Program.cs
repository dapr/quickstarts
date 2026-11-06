using System.Text.Json.Serialization;
using Dapr.Messaging.PublishSubscribe;

using var client = new DaprPublishSubscribeClientBuilder().Build();

while (true)
{
    for (var i = 1; i <= 3; i++)
    {
        var order = new Order(i);
        await client.PublishEventAsync("orderpubsub", "orders-streaming", order);
        Console.WriteLine("Published single order: " + order);
    }

    Order[] orders = [new(4), new(5), new(6)];
    var response = await client.BulkPublishEventAsync("orderpubsub", "orders-bulk-streaming", orders);

    if (response.FailedEntries.Count > 0)
    {
        foreach (var failure in response.FailedEntries)
        {
            Console.Error.WriteLine($"Failed to publish {failure.Entry.EventData}: {failure.ErrorMessage}");
        }

        throw new InvalidOperationException("Bulk publishing failed.");
    }

    foreach (var order in orders)
    {
        Console.WriteLine("Bulk published order: " + order);
    }

    await Task.Delay(TimeSpan.FromSeconds(5));
}

public record Order([property: JsonPropertyName("orderId")] int OrderId);
