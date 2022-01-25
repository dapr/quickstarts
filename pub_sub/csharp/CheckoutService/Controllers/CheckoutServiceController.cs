using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Net;
using Dapr;
using Dapr.Client;

namespace CheckoutService.controller
{
    [ApiController]
    public class CheckoutServiceController : Controller
    {
        [Topic("order_pub_sub", "orders")]
        [HttpPost("checkout")]
        public HttpResponseMessage getCheckout([FromBody] int orderId)
        {
            Console.WriteLine("Subscriber received : " + orderId);
            return new HttpResponseMessage(HttpStatusCode.OK);
        }
    }
}