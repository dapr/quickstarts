using System;
using System.Threading.Tasks;
using System.Text.Json.Serialization;
using Dapr.StateManagement;
using Dapr.StateManagement.Extensions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder();
builder.Services.AddDaprStateManagementClient()
    .WithStateStore(); // Only necessary for option 2
var app = builder.Build();

// Option 1 - Via client
var stateClient = app.Services.GetRequiredService<DaprStateManagementClient>();
for (var i = 0; i <= 100; i++)
{
    var order = new Order(i);
    
    // Save state into the state store
    await stateClient.SaveStateAsync(State.Constants.DAPR_STORE_NAME, order.OrderId.ToString(), order.ToString());
    Console.WriteLine("Saving Order: " + order);

    // Get state from the state store
    var result = await stateClient.GetStateAsync<string>(State.Constants.DAPR_STORE_NAME,order.OrderId.ToString());
    Console.WriteLine("Getting Order: " + result);
    
    // Delete state from the state store
    await stateClient.DeleteStateAsync(State.Constants.DAPR_STORE_NAME, order.OrderId.ToString());
    Console.WriteLine("Deleting Order: " + order);
    
    await Task.Delay(TimeSpan.FromSeconds(5));
}

// Option 2 - Via generated interface
// var stateStore = app.Services.GetRequiredService<IStateStore>();
// for (var i = 0; i <= 100; i++)
// {
//     var order = new Order(i);
//     
//     // Save state into the state store
//     await stateStore.SaveStateAsync(order.OrderId.ToString(), order.ToString());
//     Console.WriteLine("Saving Order: " + order);
//
//     // Get state from the state store
//     var result = await stateStore.GetStateAsync<string>(order.OrderId.ToString());
//     Console.WriteLine("Getting Order: " + result);
//     
//     // Delete state from the state store
//     await stateStore.DeleteStateAsync(order.OrderId.ToString());
//     Console.WriteLine("Deleting Order: " + order);
//     
//     await Task.Delay(TimeSpan.FromSeconds(5));
// }

public sealed record Order([property: JsonPropertyName("orderId")] int OrderId);
