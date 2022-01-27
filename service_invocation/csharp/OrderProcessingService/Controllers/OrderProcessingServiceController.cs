using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Net.Http.Headers; 

namespace OrderProcessingService.controller
{
    [ApiController]
    [Route("order")]
    public class OrderProcessingServiceController : Controller
    {
        [HttpGet]
        public void getOrder()
        {
            System.Threading.Thread.Sleep(5000);
            Random random = new Random();
            int orderId = random.Next(1,1000);
            string daprPort = "3602";
            string daprUrl = "http://localhost:" + daprPort + "/v1.0/invoke/checkout/method/checkout/" + orderId;
            string urlParameters = "";
            HttpClient client = new HttpClient();
            client.BaseAddress = new Uri(daprUrl);
            client.DefaultRequestHeaders.Accept.Add(
            new MediaTypeWithQualityHeaderValue("application/json"));
            HttpResponseMessage result = client.GetAsync(urlParameters).Result;
            Console.WriteLine("Order requested: " + orderId);
            Console.WriteLine("Result: " + result);
        }
    }
}