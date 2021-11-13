using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Dapr.Client;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Text.Json;

namespace EventService
{
    class Program
    {
        static async Task Main(string[] args)
        {
            string DAPR_STORE_NAME = "statestore";
            while(true) {
                System.Threading.Thread.Sleep(5000);
                using var client = new DaprClientBuilder().Build();
                Random random = new Random();
                int orderId = random.Next(1,1000);
                await client.SaveStateAsync(DAPR_STORE_NAME, "order_1", orderId.ToString());
                await client.SaveStateAsync(DAPR_STORE_NAME, "order_2", orderId.ToString());

                var result = await client.GetStateAsync<string>(DAPR_STORE_NAME, orderId.ToString());
                Console.WriteLine("Result after get: " + result);

                var requests = new List<StateTransactionRequest>()
                {
                    new StateTransactionRequest("order_3", JsonSerializer.SerializeToUtf8Bytes(orderId.ToString()), StateOperationType.Upsert),
                    new StateTransactionRequest("order_2", null, StateOperationType.Delete)
                };

                CancellationTokenSource source = new CancellationTokenSource();
                CancellationToken cancellationToken = source.Token;

                await client.ExecuteStateTransactionAsync(DAPR_STORE_NAME, requests, cancellationToken: cancellationToken);

                await client.DeleteStateAsync(DAPR_STORE_NAME, "order_1", cancellationToken: cancellationToken);

                Console.WriteLine("Order requested: " + orderId);
                Console.WriteLine("Result: " + result);
            }
        }
    }
}
