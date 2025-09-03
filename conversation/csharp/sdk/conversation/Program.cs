/*
Copyright 2024 The Dapr Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
#pragma warning disable DAPR_CONVERSATION

using Dapr.AI.Conversation;
using Dapr.AI.Conversation.ConversationRoles;
using Dapr.AI.Conversation.Extensions;

const string conversationComponentName = "echo";
const string prompt = "What is dapr?";

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprConversationClient();
var app = builder.Build();

var conversationClient = app.Services.GetRequiredService<DaprConversationClient>();

var conversationOptions = new ConversationOptions(conversationComponentName);
var inputs = new ConversationInput(new List<IConversationMessage>
{
    new UserMessage {
        Name = "TestUser",
        Content = [
            new MessageContent(prompt),
        ], 
    },
});

// Send a request to the echo mock LLM component
var response = await conversationClient.ConverseAsync([inputs], conversationOptions);
Console.WriteLine($"Input sent: {prompt}");

Console.Write("Output response:");

foreach (var output in response.Outputs)
{
    foreach (var choice in output.Choices)
    {
        Console.WriteLine($" {choice.Message.Content}");

        foreach (var toolCall in choice.Message.ToolCalls)
        {
            if (toolCall is CalledToolFunction calledToolFunction)
            {
                Console.WriteLine($"\t\tId: {calledToolFunction.Id}, Name: {calledToolFunction.Name}, Arguments: {calledToolFunction.JsonArguments}");
            }
            else
            {
                Console.WriteLine($"\t\tId: {toolCall.Id}");
            }
        }
    }
}
