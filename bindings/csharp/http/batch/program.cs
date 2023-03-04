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


//dapr run --app-id batch-http --app-port 7001 --resources-path ../../../components -- dotnet run

var cronBindingName = "cron";
var sqlBindingName = "sqldb";

var baseURL = Environment.GetEnvironmentVariable("BASE_URL") ?? "http://localhost";
var daprPort = Environment.GetEnvironmentVariable("DAPR_HTTP_PORT") ?? "3500";
var daprUrl = $"{baseURL}:{daprPort}/v1.0/bindings/{sqlBindingName}";

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

if (app.Environment.IsDevelopment()) {app.UseDeveloperExceptionPage();}

var httpClient = new HttpClient();
httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

// Triggered by Dapr input binding
app.MapPost("/" + cronBindingName, async () => {
     Console.WriteLine("Processing batch..");

     string jsonFile = File.ReadAllText("../../../orders.json");
     var ordersArray = JsonSerializer.Deserialize<Orders>(jsonFile);
     foreach(Order ord in ordersArray?.orders ?? new Order[] {}){
          var sqlText = $"insert into orders (orderid, customer, price) values ({ord.OrderId}, '{ord.Customer}', {ord.Price});";
          var payload = new DaprPayload(sql: new DaprPostgresBindingMetadata(cmd: sqlText), operation: "exec");
          var orderJson = JsonSerializer.Serialize<DaprPayload>(payload);
          var content = new StringContent(orderJson, Encoding.UTF8, "application/json");

          Console.WriteLine(sqlText);

          // Insert order using Dapr output binding via HTTP Post
          try {
               var resp = await httpClient.PostAsync(daprUrl, content);
               resp.EnsureSuccessStatusCode();
          } 
          catch (HttpRequestException e) {
               Console.WriteLine(e.ToString());
               throw e;
          }

     }
               
     Console.WriteLine("Finished processing batch");
     
     return Results.Ok();
});

await app.RunAsync();

public record DaprPostgresBindingMetadata([property: JsonPropertyName("sql")] string cmd);
public record DaprPayload([property: JsonPropertyName("metadata")] DaprPostgresBindingMetadata sql, [property: JsonPropertyName("operation")] string operation);
public record Order([property: JsonPropertyName("orderid")] int OrderId, [property: JsonPropertyName("customer")] string Customer, [property: JsonPropertyName("price")] float Price);
public record Orders([property: JsonPropertyName("orders")] Order[] orders);