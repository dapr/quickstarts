using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Dapr.StateManagement.Extensions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder();
builder.Services.AddDaprStateManagementClient()
    .WithStateStore();
var app = builder.Build();

var stateStore = app.Services.GetRequiredService<IStateStore>();
for (var i = 0; i <= 100; i++)
{
    var order = new Order(i);

    // Save state into the state store
    await stateStore.SaveStateAsync(order.OrderId.ToString(), order);
    Console.WriteLine("Saving Order: " + order);

    // Get state from the state store
    var result = await stateStore.GetStateAsync<Order>(order.OrderId.ToString());
    Console.WriteLine("Getting Order: " + JsonSerializer.Serialize(result));

    // Delete state from the state store
    await stateStore.DeleteStateAsync(order.OrderId.ToString());
    Console.WriteLine("Deleting Order: " + order);

    await Task.Delay(TimeSpan.FromSeconds(5));
}

public sealed record Order([property: JsonPropertyName("orderId")] int OrderId);
