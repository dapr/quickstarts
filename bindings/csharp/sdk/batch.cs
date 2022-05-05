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


// dapr run --app-id csharp-quickstart-binding-sdk --app-port 7001 --components-path ../../components -- dotnet run --project batch.csproj

var cronBindingName = "batch";
var sqlBindingName = "SqlDB";

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

if (app.Environment.IsDevelopment()) {app.UseDeveloperExceptionPage();}

app.MapPost(cronBindingName, async () => {

    string text = File.ReadAllText("../../orders.json");
    var ordersArr = JsonSerializer.Deserialize<Orders>(text);
    using var client = new DaprClientBuilder().Build();
    foreach( Order ord in ordersArr.orders){
        var sqlText = $"insert into orders (orderid, customer, price) values ({ord.OrderId}, '{ord.Customer}', {ord.Price});";
        var command = new Dictionary<string,string>(){
            {"sql",
            sqlText}
        };
        await client.InvokeBindingAsync(sqlBindingName, "exec", command,command);
        Console.WriteLine(sqlText);
    }
});

await app.RunAsync();

public record Order([property: JsonPropertyName("orderid")] int OrderId, [property: JsonPropertyName("customer")] string Customer, [property: JsonPropertyName("price")] float Price);
public record Orders([property: JsonPropertyName("orders")] Order[] orders);