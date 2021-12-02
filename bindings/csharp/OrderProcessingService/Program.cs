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
           string BINDING_NAME = "checkout";
		   string BINDING_OPERATION = "create";
           while(true) {
                System.Threading.Thread.Sleep(5000);
                Random random = new Random();
                int orderId = random.Next(1,1000);
                using var client = new DaprClientBuilder().Build();
                await client.InvokeBindingAsync(BINDING_NAME, BINDING_OPERATION, orderId);
                Console.WriteLine("Sending message: " + orderId);
		    }
        }
    }
}
