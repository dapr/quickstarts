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
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;


//dapr run --app-id csharp-input-binding-http --app-port 7001 --components-path ../../../components -- dotnet run --project input.csproj 

var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

if (app.Environment.IsDevelopment()) {app.UseDeveloperExceptionPage();}

// Dapr Kafka input binding

app.MapPost("/sample-topic", (Order requestData) => {
    Console.WriteLine("C# - Kafka HTTP input binding: { \"orderId\": " + requestData.OrderId + "}");
    return Results.Ok(requestData.OrderId);
});


await app.RunAsync();

public record Order([property: JsonPropertyName("orderId")] int OrderId);
