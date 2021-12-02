using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Mvc;

namespace CheckoutService.controller
{
    [ApiController]
    public class CheckoutServiceController : Controller
    {
        [HttpPost("/checkout")]
        public ActionResult<string> getCheckout([FromBody] int orderId)
        {
            Console.WriteLine("Received Message: " + orderId);
            return "CID" + orderId;
        }
    }
}