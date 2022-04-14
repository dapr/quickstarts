/*
Copyright 2021 The Dapr Authors
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

using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

var daprHost = "http://localhost";
var daprHttpPort = "6061";
var bindingName = "orders";
var operation = "create"; 

var baseURL = daprHost + ":" + daprHttpPort; 

var httpClient = new HttpClient();
httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

for (int i = 1; i <= 10; i++) {
    var order = new Order(i);
    var daprData = new DaprData(order, operation);
    var orderJson = JsonSerializer.Serialize<DaprData>(daprData);
    var content = new StringContent(orderJson, Encoding.UTF8, "application/json");
    // Publish an event/message using Dapr PubSub via HTTP Post
    var response = httpClient.PostAsync($"{baseURL}/v1.0/bindings/{bindingName}", content);
    Console.WriteLine("Output binding: " + orderJson);

    await Task.Delay(TimeSpan.FromSeconds(0.2));
}
public record Order([property: JsonPropertyName("orderId")] int OrderId);
public record DaprData([property: JsonPropertyName("data")] Order Data, [property: JsonPropertyName("operation")] string operation);
