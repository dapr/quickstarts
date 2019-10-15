using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Net.Http;

namespace Dapr.Sample
{
    public class MyTopic
    {
        private readonly HttpClient _client;
        private const string DAPR_URL = "http://localhost:3500/v1.0";
        public MyTopic(IHttpClientFactory httpClientFactory)
        {
            _client = httpClientFactory.CreateClient();
        }

        [FunctionName("MyTopic")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "myTopic")] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("MyTopic C# trigger function processed a request.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic daprMessage = JsonConvert.DeserializeObject(requestBody);

            log.LogInformation($"Got value: {daprMessage["data"]["message"]}");

            return new OkResult();
        }
    }
}
