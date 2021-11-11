using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Dapr.Client;
using Microsoft.AspNetCore.Mvc;
using System.Threading;

namespace EventService
{
    class Program
    {
        static async Task Main(string[] args)
        {
           while(true) {
                System.Threading.Thread.Sleep(5000);
                Random random = new Random();
                int orderId = random.Next(1,1000);
                CancellationTokenSource source = new CancellationTokenSource();
                CancellationToken cancellationToken = source.Token;
                using var client = new DaprClientBuilder().Build();
                var result = client.CreateInvokeMethodRequest(HttpMethod.Get, "checkoutservice", "checkout/" + orderId, cancellationToken);
                await client.InvokeMethodAsync(result);
                Console.WriteLine("Order requested: " + orderId);
                Console.WriteLine("Result: " + result);
		    }
        }
    }
}
