using System.Text.Json;
using System.Text.Json.Serialization;
using Dapr.Messaging.PublishSubscribe;

await WaitForSubscriptionsAsync();

using var client = new DaprPublishSubscribeClientBuilder().Build();

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

static async Task WaitForSubscriptionsAsync()
{
    // A ready sidecar does not mean the app has opened its dynamic subscriptions yet.
    using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(30));
    using var http = new HttpClient();
    string[] topics = ["orders-streaming", "orders-bulk-streaming"];

    Console.WriteLine("Waiting for streaming subscriptions.");
    while (true)
    {
        using var metadata = JsonDocument.Parse(
            await http.GetStringAsync("http://localhost:3509/v1.0/metadata", timeout.Token));

        if (metadata.RootElement.TryGetProperty("subscriptions", out var subscriptions) &&
            topics.All(topic => subscriptions.EnumerateArray().Any(subscription =>
                subscription.GetProperty("pubsubname").GetString() == "orderpubsub" &&
                subscription.GetProperty("topic").GetString() == topic &&
                subscription.GetProperty("type").GetString() == "STREAMING")))
        {
            Console.WriteLine("Streaming subscriptions are ready.");
            return;
        }

        await Task.Delay(TimeSpan.FromMilliseconds(200), timeout.Token);
    }
}

public record Order([property: JsonPropertyName("orderId")] int OrderId);
