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

using Dapr.AI.Conversation;
using Dapr.AI.Conversation.Extensions;

class Program
{
  private const string ConversationComponentName = "echo";

  static async Task Main(string[] args)
  {
    const string prompt = "What is dapr?";

    var builder = WebApplication.CreateBuilder(args);
    builder.Services.AddDaprConversationClient();
    var app = builder.Build();

    //Instantiate Dapr Conversation Client
    var conversationClient = app.Services.GetRequiredService<DaprConversationClient>();

    try
    {
      // Send a request to the echo mock LLM component
      var response = await conversationClient.ConverseAsync(ConversationComponentName, [new(prompt, DaprConversationRole.Generic)]);
      Console.WriteLine("Input sent: " + prompt);

      if (response != null)
      {
        Console.Write("Output response:");
        foreach (var resp in response.Outputs)
        {
          Console.WriteLine($" {resp.Result}");
        }
      }
    }
    catch (Exception ex)
    {
      Console.WriteLine("Error: " + ex.Message);
    }
  }
}
