using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Net;
using Dapr;
using Dapr.Client;

namespace order_processor.controller
{
    [ApiController]
    public class order_processorController : Controller
    {
        [Topic("order_pub_sub", "orders")]
        [HttpPost("order-processor")]
        public HttpResponseMessage getCheckout([FromBody] int orderId)
        {
            Console.WriteLine("Subscriber received : " + orderId);
            return new HttpResponseMessage(HttpStatusCode.OK);
        }
    }
}