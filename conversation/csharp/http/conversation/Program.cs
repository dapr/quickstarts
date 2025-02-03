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

using System.Net.Http;
using System.Text.Json;
using System.Text;

class Program
{
  private const string ConversationComponentName = "echo";

  static async Task Main(string[] args)
  {
    var daprHost = Environment.GetEnvironmentVariable("DAPR_HOST") ?? "http://localhost";
    var daprHttpPort = Environment.GetEnvironmentVariable("DAPR_HTTP_PORT") ?? "3500";

    var client = new HttpClient
    {
      Timeout = TimeSpan.FromSeconds(15)
    };

    var inputBody = new
    {
      name = "echo",
      inputs = new[] { new { message = "What is dapr?" } },
      parameters = new { },
      metadata = new { }
    };

    var daprUrl = $"{daprHost}:{daprHttpPort}/v1.0-alpha1/conversation/{ConversationComponentName}/converse";

    try
    {
      var content = new StringContent(JsonSerializer.Serialize(inputBody), Encoding.UTF8, "application/json");

      // Send a request to the echo mock LLM component
      var response = await client.PostAsync(daprUrl, content);
      response.EnsureSuccessStatusCode();

      Console.WriteLine("Input sent: " + inputBody.inputs[0].message);

      var responseBody = await response.Content.ReadAsStringAsync();

      // Parse the response
      var data = JsonSerializer.Deserialize<Dictionary<string, List<Dictionary<string, string>>>>(responseBody);
      var result = data?["outputs"]?[0]?["result"];

      Console.WriteLine("Output response: " + result);
    }
    catch (Exception ex)
    {
      Console.WriteLine("Error: " + ex.Message);
    }
  }
}
