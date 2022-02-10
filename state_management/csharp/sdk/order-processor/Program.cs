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
while(true) {
    System.Threading.Thread.Sleep(5000);
    using var client = new DaprClientBuilder().Build();
    Random random = new Random();
    var order = new Order(random.Next(1,1000));
    // Save state into the state store
    await client.SaveStateAsync(DAPR_STORE_NAME, "orderId", order.ToString());
    // Get state from the state store
    var result = await client.GetStateAsync<string>(DAPR_STORE_NAME, "orderId");
    Console.WriteLine("Result after get: " + result);
    // Delete state from the state store
    CancellationTokenSource source = new CancellationTokenSource();
    CancellationToken cancellationToken = source.Token;
    await client.DeleteStateAsync(DAPR_STORE_NAME, "orderId", cancellationToken: cancellationToken);
    Console.WriteLine("Order requested: " + order);
    Console.WriteLine("Result: " + result);
}

public record Order([property: JsonPropertyName("orderId")] int orderId);
