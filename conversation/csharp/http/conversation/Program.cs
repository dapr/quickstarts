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
using System.Text.Json;

// const string conversationComponentName = "echo";
const string conversationText = "What is dapr?";
const string toolCallInput = "What is the weather like in San Francisco in celsius?";

//
// Setup

var httpClient = new HttpClient();

//
// Simple Conversation

var conversationRequestBody = JsonSerializer.Deserialize<Dictionary<string, object?>>("""
  {
    "name": "anthropic",
    "inputs": [{
      "messages": [{
        "of_user": {
          "content": [{
            "text": "What is dapr?"
          }]
        }
      }]
    }],
    "parameters": {},
    "metadata": {}
  }
""");

// {"outputs":[{"choices":[{"finishReason":"stop","message":{"content":"What is dapr?"}}]}]}
var conversationResponse = await httpClient.PostAsJsonAsync("http://localhost:3500/v1.0-alpha2/conversation/echo/converse", conversationRequestBody);
var conversationResult = await conversationResponse.Content.ReadFromJsonAsync<JsonElement>();

var conversationContent = conversationResult
  .GetProperty("outputs")
  .EnumerateArray()
  .First()
  .GetProperty("choices")
  .EnumerateArray()
  .First()
  .GetProperty("message")
  .GetProperty("content")
  .GetString();

Console.WriteLine($"Conversation input sent: {conversationText}");
Console.WriteLine($"Output response: {conversationContent}");

//
// Tool Calling

var toolCallRequestBody = JsonSerializer.Deserialize<Dictionary<string, object?>>("""
  {
    "name": "anthropic",
    "inputs": [
      {
        "messages": [
          {
            "of_user": {
              "content": [
                {
                  "text": "What is the weather like in San Francisco in celsius?"
                }
              ]
            }
          }
        ],
        "scrubPII": false
      }
    ],
    "parameters": {
      "max_tokens": {
        "@type": "type.googleapis.com/google.protobuf.Int64Value",
        "value": "100"
      },
      "model": {
        "@type": "type.googleapis.com/google.protobuf.StringValue",
        "value": "claude-3-5-sonnet-20240620"
      }
    },
    "metadata": {
      "api_key": "test-key",
      "version": "1.0"
    },
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

// {"outputs":[{"choices":[{"finishReason":"tool_calls","message":{"content":"What is the weather like in San Francisco in celsius?","toolCalls":[{"id":"0","function":{"name":"get_weather","arguments":"location,unit"}}]}}]}]}
var toolCallingResponse = await httpClient.PostAsJsonAsync("http://localhost:3500/v1.0-alpha2/conversation/echo/converse", toolCallRequestBody);
var toolCallingResult = await toolCallingResponse.Content.ReadFromJsonAsync<JsonElement>();

var toolCallingContent = toolCallingResult
  .GetProperty("outputs")
  .EnumerateArray()
  .First()
  .GetProperty("choices")
  .EnumerateArray()
  .First()
  .GetProperty("message")
  .GetProperty("content");

var functionCalled = toolCallingResult
  .GetProperty("outputs")
  .EnumerateArray()
  .First()
  .GetProperty("choices")
  .EnumerateArray()
  .First()
  .GetProperty("message")
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
});

Console.WriteLine($"Tool calling input sent: {toolCallInput}");
Console.WriteLine($"Output message: {toolCallingContent}");
Console.WriteLine("Tool calls detected:");
Console.WriteLine($"Tool call: {toolCallJson}");
Console.WriteLine($"Function name: {functionName}");
Console.WriteLine($"Function arguments: {functionArguments}");
