using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Dapr;

namespace csharp_subscriber.Controllers
{
    [ApiController]
    public class MessageController : ControllerBase
    {
        private readonly ILogger<MessageController> _logger;
        
        public MessageController(ILogger<MessageController> logger)
        {
            _logger = logger;
        }

        [Topic("pubsub", "A")]
        [HttpPost("A")]
        public ActionResult TopicA(Dictionary<string, string> item)
        {
            _logger.LogInformation($"A: {item["message"]}");
            return Ok();
        }

        [Topic("pubsub", "B")]
        [HttpPost("B")]
        public ActionResult TopicB(Dictionary<string, string> item)
        {
            _logger.LogInformation($"B: {item["message"]}");
            return Ok();
        }

        [Topic("pubsub", "C")]
        [HttpPost("C")]
        public ActionResult TopicC(Dictionary<string, string> item)
        {
            _logger.LogInformation($"C: {item["message"]}");
            return Ok();
        }
    }
}
