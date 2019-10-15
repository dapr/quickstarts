using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Dapr.Sample
{
    public class Subscribe
    {
        public Subscribe()
        {

        }

        [FunctionName("Subscribe")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "dapr/subscribe")] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("Subscription HTTP trigger function processed a request.");

            string[] subscriptions = { "myTopic" };
            return new OkObjectResult(JsonConvert.SerializeObject(subscriptions));
        }
    }
}
