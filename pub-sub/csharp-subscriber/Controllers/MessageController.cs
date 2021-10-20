using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Dapr;
using csharp_subscriber.Models;

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
        public ActionResult TopicA(MessageEvent item)
        {
            _logger.LogInformation($"{item.MessageType}: {item.Message}");
            return Ok();
        }

        [Topic("pubsub", "B")]
        [HttpPost("B")]
        public ActionResult TopicB(MessageEvent item)
        {
            _logger.LogInformation($"{item.MessageType}: {item.Message}");
            return Ok();
        }

        [Topic("pubsub", "C")]
        [HttpPost("C")]
        public ActionResult TopicC(Dictionary<string, string> item)
        {
            _logger.LogInformation($"{item["messageType"]}: {item["message"]}");
            return Ok();
        }
    }
}
