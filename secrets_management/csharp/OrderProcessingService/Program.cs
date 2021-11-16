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
            string SECRET_STORE_NAME = "localsecretstore";
            using var client = new DaprClientBuilder().Build();
            var secret = await client.GetSecretAsync(SECRET_STORE_NAME, "secret");
            Console.WriteLine($"Result: {string.Join(", ", secret)}");
            secret = await client.GetSecretAsync(SECRET_STORE_NAME, "secret");
            Console.WriteLine($"Result for bulk: {string.Join(", ", secret.Keys)}");
        }
    }
}
