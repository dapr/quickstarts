using Dapr.Actors.Next.Abstractions;
using Dapr.Actors.Next.Abstractions.Options;
using Dapr.Actors.Next.Core.Client;
using SmartDevice;
using SmartDevice.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprActors();

var app = builder.Build();

app.MapPost("/setup", async (
    IActorProxyFactory proxies,
    CancellationToken cancellationToken) =>
{
    var device1 = CreateDevice(proxies, "1");
    var device2 = CreateDevice(proxies, "2");
    var controller = CreateController(proxies);

    await controller.RegisterDevices(["1", "2"], cancellationToken);

    await device1.SetData(
        new SmartDeviceData { Location = "First Floor", Status = "Ready" },
        cancellationToken);
    await device2.SetData(
        new SmartDeviceData { Location = "Second Floor", Status = "Ready" },
        cancellationToken);

    return await controller.GetDevices(cancellationToken);
});

app.MapGet("/devices", (
    IActorProxyFactory proxies,
    CancellationToken cancellationToken) =>
    CreateController(proxies).GetDevices(cancellationToken));

app.MapPost("/devices/{deviceId}/detect-smoke", (
    string deviceId,
    IActorProxyFactory proxies,
    CancellationToken cancellationToken) =>
    CreateDevice(proxies, deviceId).DetectSmoke(cancellationToken));

await app.RunAsync();
return;

static ISmartDeviceActor CreateDevice(IActorProxyFactory proxies, string deviceId) =>
    proxies.Create<ISmartDeviceActor>(ActorId.Create(deviceId), "SmokeDetector");

static IControllerActor CreateController(IActorProxyFactory proxies) =>
    proxies.Create<IControllerActor>(ActorId.Create("controller"), "Controller");
