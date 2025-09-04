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

using System.Text.Json;
using Dapr.AI.Conversation;
using Dapr.AI.Conversation.ConversationRoles;
using Dapr.AI.Conversation.Extensions;
using Dapr.AI.Conversation.Tools;

const string conversationComponentName = "echo";
const string conversationText = "What is dapr?";
const string toolCallInput = "What is the weather like in San Francisco in celsius?";

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprConversationClient();
var app = builder.Build();

//
// Setup

var conversationClient = app.Services.GetRequiredService<DaprConversationClient>();

var conversationOptions = new ConversationOptions(conversationComponentName)
{
    ScrubPII = false,
    ToolChoice = ToolChoice.Auto,
    Temperature = 0.7,
    Tools = [
        new ToolFunction("function")
        {
            Name = "get_weather",
            Description = "Get the current weather for a location",
            Parameters = JsonSerializer.Deserialize<Dictionary<string, object?>>("""
            {
              "type": "object",
              "properties": {
                "location": {
                  "type": "string",
                  "description": "The city and state, e.g. San Francisco, CA"
                },
                "unit": {
                  "type": "string",
                  "enum": ["celsius", "fahrenheit"],
                  "description": "The temperature unit to use"
                }
              },
              "required": ["location"]
            }
            """) ?? throw new("Unable to parse tool function parameters."),
        },
    ],
};

//
// Simple Conversation

var conversationResponse = await conversationClient.ConverseAsync(
    [new ConversationInput(new List<IConversationMessage>
    {
        new UserMessage {
            Name = "TestUser",
            Content = [
                new MessageContent(conversationText),
            ],
        },
    })], 
    conversationOptions
);

Console.WriteLine($"Conversation input sent: {conversationText}");
Console.WriteLine($"Output response: {conversationResponse.Outputs.First().Choices.First().Message.Content}");

//
// Tool Calling

var toolCallResponse = await conversationClient.ConverseAsync(
    [new ConversationInput(new List<IConversationMessage>
    {
        new UserMessage {
            Name = "TestUser",
            Content = [
                new MessageContent(toolCallInput),
            ],
        },
    })], 
    conversationOptions
);

Console.WriteLine($"Tool calling input sent: {toolCallInput}");
Console.WriteLine($"Output message: {toolCallResponse.Outputs.First().Choices.First().Message.Content}");
Console.WriteLine($"Tool calls detected:");

var functionToolCall = toolCallResponse.Outputs.First().Choices.First().Message.ToolCalls.First() as CalledToolFunction
    ?? throw new("Unexpected tool call type for demo.");

var toolCallJson = JsonSerializer.Serialize(new
{
    id = 0,
    function = new
    {
        name = functionToolCall.Name,
        arguments = functionToolCall.JsonArguments,
    },
});
Console.WriteLine($"Tool call: {toolCallJson}");
Console.WriteLine($"Function name: {functionToolCall.Name}");
Console.WriteLine($"Function arguments: {functionToolCall.JsonArguments}");
