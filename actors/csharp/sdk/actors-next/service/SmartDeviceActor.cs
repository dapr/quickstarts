using Dapr.Actors.Next.Abstractions;
using Dapr.Actors.Next.Abstractions.Attributes;
using Dapr.Actors.Next.Abstractions.State;
using Dapr.Actors.Next.Core.Activation;
using Dapr.Actors.Next.Core.Client;

namespace SmartDevice;

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
}

[DaprActor("SmokeDetector")]
public sealed class SmartDeviceActor(
    ActorActivationContext context,
    IActorProxyFactory proxies) : Actor, ISmartDeviceActor
{
    private const string DeviceStateName = "device";

    protected override ActorId Id => context.ActorId;

    protected override IActorStateAccessor State => context.State;

    public async Task SetData(SmartDeviceData data, CancellationToken cancellationToken = default)
    {
        var state = await State.GetOrCreateAsync(
            DeviceStateName,
            static () => new SmartDeviceData(),
            cancellationToken);

        state.Value.Location = data.Location;
        state.Value.Status = data.Status;
    }

    public async Task<SmartDeviceData> GetData(CancellationToken cancellationToken = default)
    {
        var state = await State.GetOrCreateAsync(
            DeviceStateName,
            static () => new SmartDeviceData(),
            cancellationToken);

        return state.Value;
    }

    public async Task DetectSmoke(CancellationToken cancellationToken = default)
    {
        await SoundAlarm(cancellationToken);
        await CreateController().TriggerAlarm(Id.Value, cancellationToken);
    }

    public async Task SoundAlarm(CancellationToken cancellationToken = default)
    {
        var state = await State.GetOrCreateAsync(
            DeviceStateName,
            static () => new SmartDeviceData(),
            cancellationToken);

        state.Value.Status = "Alarm";
    }

    public async Task ClearAlarm(CancellationToken cancellationToken = default)
    {
        var state = await State.GetOrCreateAsync(
            DeviceStateName,
            static () => new SmartDeviceData(),
            cancellationToken);

        state.Value.Status = "Ready";
    }

    private IControllerActor CreateController() =>
        proxies.Create<IControllerActor>(ActorId.Create("controller"), "Controller");
}
