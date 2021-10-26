using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Net.Http;
using OrderProcessingService.model;
using Dapr.Client;

namespace OrderProcessingService.controller
{
    [ApiController]
    [Route("order")]
    public class OrderProcessingServiceController : Controller
    {
        [HttpGet]
        [Route("{orderId}")] // concatenates with the route above
        public async Task<Order> getProcessedOrder([FromRoute]int orderId, CancellationToken cancellationToken)
        {
            using var client = new DaprClientBuilder().Build();
            var result = client.CreateInvokeMethodRequest(HttpMethod.Get, "checkoutservice", "checkout/" + orderId, cancellationToken);
            Console.WriteLine("Order requested: " + orderId);
            Console.WriteLine("Result: " + result);
            return new Order("order1",  orderId);
        }
    }
}