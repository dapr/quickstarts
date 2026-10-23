using Dapr.Actors.Next.Abstractions;
using Dapr.Actors.Next.Abstractions.Options;
using Dapr.Actors.Next.Core.Client;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SmartDevice.Interfaces;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddDaprActors();

using var host = builder.Build();
var proxies = host.Services.GetRequiredService<IActorProxyFactory>();

var device1 = proxies.Create<ISmartDeviceActor>(ActorId.Create("1"), "SmokeDetector");
var device2 = proxies.Create<ISmartDeviceActor>(ActorId.Create("2"), "SmokeDetector");
var controller = proxies.Create<IControllerActor>(ActorId.Create("controller"), "Controller");

await controller.RegisterDevices(["1", "2"]);
Console.WriteLine("Calling SetData on SmokeDetector:1...");
await device1.SetData(new SmartDeviceData { Location = "First Floor", Status = "Ready" });
Console.WriteLine("SetData completed for SmokeDetector:1");
Console.WriteLine("Calling SetData on SmokeDetector:2...");
await device2.SetData(new SmartDeviceData { Location = "Second Floor", Status = "Ready" });
Console.WriteLine("SetData completed for SmokeDetector:2");

Console.WriteLine($"Registered devices: {string.Join(", ", await controller.GetRegisteredDevices())}");
Console.WriteLine($"Device 1 state: {await device1.GetData()}");
Console.WriteLine($"Device 2 state: {await device2.GetData()}");

Console.WriteLine("Detecting smoke on Device 1...");
await device1.DetectSmoke();
Console.WriteLine($"Device 1 state: {await device1.GetData()}");
Console.WriteLine($"Device 2 state: {await device2.GetData()}");

Console.WriteLine("Waiting 16 seconds for the reminder to clear alarms...");
await Task.Delay(TimeSpan.FromSeconds(16));
Console.WriteLine($"Device 1 state: {await device1.GetData()}");
Console.WriteLine($"Device 2 state: {await device2.GetData()}");
