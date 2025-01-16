using System.Text;
using Dapr.AI.Conversation;
using Dapr.AI.Conversation.Extensions;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprConversationClient();
var app = builder.Build();

var conversationClient = app.Services.GetRequiredService<DaprConversationClient>();
var logger = app.Services.GetRequiredService<ILogger<Program>>();

const string prompt = "Please write a witty sonnet about the Dapr distributed programming framework at dapr.io";
var response = await conversationClient.ConverseAsync("conversation",
        [new(prompt, DaprConversationRole.Generic)]);
Log.LogRequest(logger, prompt);

var stringBuilder = new StringBuilder();
foreach (var resp in response.Outputs)
{
        stringBuilder.AppendLine(resp.Result);
}
Log.LogResponse(logger, stringBuilder.ToString());

static partial class Log
{
        [LoggerMessage(LogLevel.Information, "Sent prompt to conversation API: '{message}'")]
        internal static partial void LogRequest(ILogger logger, string message);
        
        [LoggerMessage(LogLevel.Information, "Received message from the conversation API: '{message}'")]
        internal static partial void LogResponse(ILogger logger, string message);
}