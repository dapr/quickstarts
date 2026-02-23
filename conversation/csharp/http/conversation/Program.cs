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

using System.Net.Http.Json;
using System.Text.Encodings.Web;
using System.Text.Json;

const string conversationText = "What is dapr?";
const string toolCallInput = "What is the weather like in San Francisco in celsius?";

//
// Setup

var httpClient = new HttpClient();

//
// Simple Conversation

var conversationRequestBody = JsonSerializer.Deserialize<Dictionary<string, object?>>("""
  {
    "inputs": [{
      "messages": [{
        "ofUser": {
          "content": [{
            "text": "What is dapr?"
          }]
        }
      }]
    }],
    "parameters": {},
    "metadata": {},
    "response_format": {
      "type": "object",
      "properties": {"answer": {"type": "string"}},
      "required": ["answer"]
    },
    "prompt_cache_retention": "86400s"
  }
""");

var conversationResponse = await httpClient.PostAsJsonAsync("http://localhost:3500/v1.0-alpha2/conversation/ollama/converse", conversationRequestBody);
conversationResponse.EnsureSuccessStatusCode();
var responseText = await conversationResponse.Content.ReadAsStringAsync();
var conversationResult = JsonSerializer.Deserialize<JsonElement>(responseText);

if (conversationResult.ValueKind == JsonValueKind.Null || conversationResult.ValueKind == JsonValueKind.Undefined)
{
    throw new InvalidOperationException($"Failed to parse response as JSON. Response: {responseText}");
}

if (!conversationResult.TryGetProperty("outputs", out var outputsElement))
{
    throw new InvalidOperationException($"Response does not contain 'outputs' property. Response: {responseText}");
}

var firstOutput = outputsElement.EnumerateArray().First();

Console.WriteLine($"Conversation input sent: {conversationText}");
if (firstOutput.TryGetProperty("model", out var modelElement) && modelElement.GetString() is { Length: > 0 } model)
    Console.WriteLine($"Model: {model}");
if (firstOutput.TryGetProperty("usage", out var usageElement))
    Console.WriteLine($"Usage: prompt_tokens={usageElement.GetProperty("promptTokens").GetString()} completion_tokens={usageElement.GetProperty("completionTokens").GetString()} total_tokens={usageElement.GetProperty("totalTokens").GetString()}");

var conversationContent = firstOutput
  .GetProperty("choices")
  .EnumerateArray()
  .First()
  .GetProperty("message")
  .GetProperty("content")
  .GetString();

Console.WriteLine($"Output response: {conversationContent}");

//
// Tool Calling

var toolCallRequestBody = JsonSerializer.Deserialize<Dictionary<string, object?>>("""
  {
    "inputs": [
      {
        "messages": [
          {
            "ofUser": {
              "content": [
                {
                  "text": "What is the weather like in San Francisco in celsius?"
                }
              ]
            }
          }
        ],
        "scrubPii": false
      }
    ],
    "parameters": {},
    "metadata": {},
    "response_format": {
      "type": "object",
      "properties": {"answer": {"type": "string"}},
      "required": ["answer"]
    },
    "prompt_cache_retention": "86400s",
    "scrubPii": false,
    "temperature": 0.7,
    "tools": [
      {
        "function": {
          "name": "get_weather",
          "description": "Get the current weather for a location",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {
                "type": "string",
                "description": "The city and state, e.g. San Francisco, CA"
              },
              "unit": {
                "type": "string",
                "enum": [
                  "celsius",
                  "fahrenheit"
                ],
                "description": "The temperature unit to use"
              }
            },
            "required": [
              "location"
            ]
          }
        }
      }
    ],
    "toolChoice": "auto"
  }
""");

var toolCallingResponse = await httpClient.PostAsJsonAsync("http://localhost:3500/v1.0-alpha2/conversation/ollama/converse", toolCallRequestBody);
toolCallingResponse.EnsureSuccessStatusCode();
var toolCallingResponseText = await toolCallingResponse.Content.ReadAsStringAsync();
var toolCallingResult = JsonSerializer.Deserialize<JsonElement>(toolCallingResponseText);

if (toolCallingResult.ValueKind == JsonValueKind.Null || toolCallingResult.ValueKind == JsonValueKind.Undefined)
{
    throw new InvalidOperationException($"Failed to parse response as JSON. Response: {toolCallingResponseText}");
}

if (!toolCallingResult.TryGetProperty("outputs", out var toolCallingOutputsElement))
{
    throw new InvalidOperationException($"Response does not contain 'outputs' property. Response: {toolCallingResponseText}");
}

var messageElement = toolCallingOutputsElement
  .EnumerateArray()
  .First()
  .GetProperty("choices")
  .EnumerateArray()
  .First()
  .GetProperty("message");

var toolCallingContent = messageElement.TryGetProperty("content", out var contentElement)
    ? contentElement.GetString()
    : null;

var functionCalled = messageElement
  .GetProperty("toolCalls")
  .EnumerateArray()
  .First()
  .GetProperty("function");

var functionName = functionCalled.GetProperty("name").GetString();
var functionArguments = functionCalled.GetProperty("arguments").GetString();

var toolCallJson = JsonSerializer.Serialize(new
{
  id = 0,
  function = new
  {
    name = functionName,
    arguments = functionArguments,
  },
}, s_jsonOptions);

Console.WriteLine($"Tool calling input sent: {toolCallInput}");
Console.WriteLine($"Output message: {toolCallingContent}");
Console.WriteLine("Tool calls detected:");
Console.WriteLine($"Tool call: {toolCallJson}");
Console.WriteLine($"Function name: {functionName}");
Console.WriteLine($"Function arguments: {functionArguments}");

static partial class Program
{
    static readonly JsonSerializerOptions s_jsonOptions = new() { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping };
}
