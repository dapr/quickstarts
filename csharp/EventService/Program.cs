using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;

namespace EventService
{
    class Program
    {
        static void Main(string[] args)
        {
           while(true) {
                System.Threading.Thread.Sleep(5000);
                Random random = new Random();
                int orderId = random.Next(1,1000);
                String uri = "https://localhost:6001/order/" + orderId;
                HttpClient client = new HttpClient();
                client.BaseAddress = new Uri(uri);
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                HttpResponseMessage result = client.GetAsync(uri).Result;
                Console.WriteLine("Order processed for order id " + orderId);
                Console.WriteLine(result);
		    }
        }
    }
}
