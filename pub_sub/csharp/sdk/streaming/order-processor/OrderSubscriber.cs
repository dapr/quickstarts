using System.Text.Json;
using System.Text.Json.Serialization;
using Dapr.Messaging.PublishSubscribe;
using Microsoft.Extensions.Hosting;

public class OrderSubscriber : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var client = new DaprPublishSubscribeClientBuilder().Build();
        var options = new DaprSubscriptionOptions(
            new MessageHandlingPolicy(TimeSpan.FromSeconds(10), TopicResponseAction.Retry))
        {
            ErrorHandler = exception =>
            {
                Console.Error.WriteLine($"Streaming subscription error: {exception}");
                return Task.CompletedTask;
            }
        };

        await using var singleSubscription = await client.SubscribeAsync(
            "orderpubsub", "orders-streaming", options, HandleOrderAsync, stoppingToken);
        await using var bulkSubscription = await client.SubscribeAsync(
            "orderpubsub", "orders-bulk-streaming", options, HandleOrderAsync, stoppingToken);

        Console.WriteLine("Streaming subscriptions opened.");
        try
        {
            await Task.Delay(Timeout.InfiniteTimeSpan, stoppingToken);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // Disposing both subscriptions closes their streams during host shutdown.
        }
    }

    private static Task<TopicResponseAction> HandleOrderAsync(
        TopicMessage message, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var order = JsonSerializer.Deserialize<Order>(message.Data.Span)
            ?? throw new JsonException("Expected an order payload.");
        var label = message.Topic == "orders-streaming" ? "single order" : "bulk-published order";
        Console.WriteLine($"Subscriber received {label}: {order}");
        return Task.FromResult(TopicResponseAction.Success);
    }
}

public record Order([property: JsonPropertyName("orderId")] int OrderId);
