using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Dapr.Client;

var client = DaprClient.CreateInvokeHttpClient(appId: "order-processor");

for (int i = 1; i <= 20; i++) {
    var order = new Order(i);

    var cts = new CancellationTokenSource();
    Console.CancelKeyPress += (object? sender, ConsoleCancelEventArgs e) => cts.Cancel();

    // Invoking a service
    var response = await client.PostAsJsonAsync("/orders", order, cts.Token);

    Console.WriteLine("Order passed: " + order);

    await Task.Delay(TimeSpan.FromSeconds(1));
}

public record Order([property: JsonPropertyName("orderId")] int OrderId);
