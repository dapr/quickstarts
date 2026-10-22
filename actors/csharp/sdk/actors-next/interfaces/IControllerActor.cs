using Dapr.Actors.Next.Abstractions;
using Dapr.Actors.Next.Abstractions.Attributes;

namespace SmartDevice.Interfaces;

[GenerateActorClient]
public interface IControllerActor : IActor
{
    Task RegisterDevices(string[] deviceIds, CancellationToken cancellationToken = default);

    Task<string[]> GetRegisteredDevices(CancellationToken cancellationToken = default);

    Task<SmartDeviceView[]> GetDevices(CancellationToken cancellationToken = default);

    Task TriggerAlarm(string detectingDeviceId, CancellationToken cancellationToken = default);

    Task ClearAlarms(CancellationToken cancellationToken = default);
}

public sealed record SmartDeviceView(string Id, string Location, string Status);
