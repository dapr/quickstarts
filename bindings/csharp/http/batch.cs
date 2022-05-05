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


//dapr run --app-id csharp-quickstart-binding-http --app-port 7001 --dapr-http-port 8000 --components-path ../../components -- dotnet run --project batch.csproj 

var cronBindingName = "batch";
var sqlBindingName = "SqlDB";

const string daprHost = "http://localhost";
const string daprHttpPort = "8000";

var baseURL = daprHost + ":" + daprHttpPort; 

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

if (app.Environment.IsDevelopment()) {app.UseDeveloperExceptionPage();}

var httpClient = new HttpClient();
httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

app.MapPost(cronBindingName, () => {
     string text = File.ReadAllText("../../orders.json");
     var ordersArr = JsonSerializer.Deserialize<Orders>(text);
     foreach( Order ord in ordersArr.orders){
          var sqlText = $"insert into orders (orderid, customer, price) values ({ord.OrderId}, '{ord.Customer}', {ord.Price});";
          var sqlObj = new SQLCmd(sqlText);
          var daprObj = new DaprBindingData(sqlObj,"exec");
          var orderJson = JsonSerializer.Serialize<DaprBindingData>(daprObj);
          var content = new StringContent(orderJson, Encoding.UTF8, "application/json");
          httpClient.PostAsync($"{baseURL}/v1.0/bindings/{sqlBindingName}", content);
          Console.WriteLine(sqlText);
     }
});

await app.RunAsync();

public record SQLCmd([property: JsonPropertyName("sql")] string cmd);
public record DaprBindingData([property: JsonPropertyName("metadata")] SQLCmd sql, [property: JsonPropertyName("operation")] string operation);
public record Order([property: JsonPropertyName("orderid")] int OrderId, [property: JsonPropertyName("customer")] string Customer, [property: JsonPropertyName("price")] float Price);
public record Orders([property: JsonPropertyName("orders")] Order[] orders);