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
using System.IO;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Dapr.Client;


// dapr run --app-id batch-sdk --app-port 7002 --resources-path ../../../components -- dotnet run

var cronBindingName = "cron";
var sqlBindingName = "sqldb";

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

if (app.Environment.IsDevelopment()) {app.UseDeveloperExceptionPage();}

// Triggered by Dapr input binding
app.MapPost("/" + cronBindingName, async () => {

    Console.WriteLine("Processing batch..");
    string jsonFile = File.ReadAllText("../../../orders.json");
    var ordersArray = JsonSerializer.Deserialize<Orders>(jsonFile);
    using var client = new DaprClientBuilder().Build();
    foreach(Order ord in ordersArray?.orders ?? new Order[] {}){
        var sqlText = $"insert into orders (orderid, customer, price) values ({ord.OrderId}, '{ord.Customer}', {ord.Price});";
        var command = new Dictionary<string,string>(){
            {"sql",
            sqlText}
        };
        Console.WriteLine(sqlText);

        // Insert order using Dapr output binding via Dapr Client SDK
        await client.InvokeBindingAsync(bindingName: sqlBindingName, operation: "exec", data: "", metadata: command);
    }

    Console.WriteLine("Finished processing batch");

    return Results.Ok();
});

await app.RunAsync();

public record Order([property: JsonPropertyName("orderid")] int OrderId, [property: JsonPropertyName("customer")] string Customer, [property: JsonPropertyName("price")] float Price);
public record Orders([property: JsonPropertyName("orders")] Order[] orders);