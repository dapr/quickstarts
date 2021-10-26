using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Mvc;

namespace CheckoutService.controller
{
    [ApiController]
    [Route("checkout")]
    public class CheckoutServiceController : Controller
    {
        [HttpGet]
        [Route("{orderId}")]
        public ActionResult<string> getCheckout([FromRoute]int orderId)
        {
            Console.WriteLine("Checked out order id : " + orderId);
            return "CID" + orderId;
        }
    }
}