using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Dapr.Client;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Text.Json;
using System.Text;
using System.Text.Json.Serialization;

string DAPR_STORE_NAME = "statestore";
var client = new DaprClientBuilder().Build();
while(true) {
    Random random = new Random();
    var order = new Order(random.Next(1,1000));

    // Save state into the state store
    await client.SaveStateAsync(DAPR_STORE_NAME, "order1", order.ToString());

    // Get state from the state store
    var result = await client.GetStateAsync<string>(DAPR_STORE_NAME, "order1");
    Console.WriteLine("Result after get: " + result);
    
    // Delete state from the state store
    await client.DeleteStateAsync(DAPR_STORE_NAME, "order1");
    Console.WriteLine("Order requested: " + order);
    Console.WriteLine("Result: " + result);
    
    await Task.Delay(TimeSpan.FromSeconds(5));
}

public record Order([property: JsonPropertyName("orderId")] int orderId);
