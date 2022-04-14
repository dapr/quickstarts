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

using System;
using Dapr.Client;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

var bindingName = "orders";
var opration = "create";

for (int i = 1; i <= 10; i++) {
    var order = new Order(i);
    using var client = new DaprClientBuilder().Build();

    // Publish a Kafka message using output binding
    await client.InvokeBindingAsync(bindingName, opration, order);
    Console.WriteLine("Output binding: " + order);

    await Task.Delay(TimeSpan.FromSeconds(0.2));
}

public record Order([property: JsonPropertyName("orderId")] int OrderId);