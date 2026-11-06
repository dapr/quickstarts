using Dapr.Actors.Next.Abstractions;
using Dapr.Actors.Next.Abstractions.Attributes;

namespace SmartDevice.Interfaces;

[GenerateActorClient]
public interface ISmartDeviceActor : IActor
{
    Task SetData(SmartDeviceData data, CancellationToken cancellationToken = default);

    Task<SmartDeviceData> GetData(CancellationToken cancellationToken = default);

    Task DetectSmoke(CancellationToken cancellationToken = default);

    Task SoundAlarm(CancellationToken cancellationToken = default);

    Task ClearAlarm(CancellationToken cancellationToken = default);
}

public sealed class SmartDeviceData
{
    public string Location { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public override string ToString() => $"Location: {Location}, Status: {Status}";
}
