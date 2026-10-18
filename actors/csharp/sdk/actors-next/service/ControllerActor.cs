using Dapr.Actors.Next.Abstractions;
using Dapr.Actors.Next.Abstractions.Attributes;
using Dapr.Actors.Next.Abstractions.State;
using Dapr.Actors.Next.Core.Activation;
using Dapr.Actors.Next.Core.Client;
using Dapr.Actors.Next.Core.Timers;

namespace SmartDevice;

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

public sealed class ControllerState
{
    public string[] DeviceIds { get; set; } = [];
}

[DaprActor("Controller")]
public sealed class ControllerActor(
    ActorActivationContext context,
    IActorProxyFactory proxies,
    IActorReminderScheduler reminders) : Actor, IControllerActor
{
    private const string ControllerStateName = "controller";

    protected override ActorId Id => context.ActorId;

    protected override IActorStateAccessor State => context.State;

    public async Task RegisterDevices(string[] deviceIds, CancellationToken cancellationToken = default)
    {
        await reminders.CancelAsync("Controller", Id, nameof(ClearAlarms), cancellationToken);

        var state = await GetControllerState(cancellationToken);
        state.Value.DeviceIds = deviceIds;
    }

    public async Task<string[]> GetRegisteredDevices(CancellationToken cancellationToken = default)
    {
        var state = await GetControllerState(cancellationToken);
        return state.Value.DeviceIds;
    }

    public async Task<SmartDeviceView[]> GetDevices(CancellationToken cancellationToken = default)
    {
        var deviceIds = await GetRegisteredDevices(cancellationToken);
        var devices = new List<SmartDeviceView>(deviceIds.Length);

        foreach (var deviceId in deviceIds)
        {
            var data = await CreateDevice(deviceId).GetData(cancellationToken);
            devices.Add(new SmartDeviceView(deviceId, data.Location, data.Status));
        }

        return devices.ToArray();
    }

    public async Task TriggerAlarm(
        string detectingDeviceId,
        CancellationToken cancellationToken = default)
    {
        var deviceIds = await GetRegisteredDevices(cancellationToken);

        foreach (var deviceId in deviceIds.Where(deviceId => deviceId != detectingDeviceId))
        {
            await CreateDevice(deviceId).SoundAlarm(cancellationToken);
        }

        await reminders.ScheduleAsync(
            "Controller",
            Id,
            nameof(ClearAlarms),
            TimeSpan.FromSeconds(5),
            TimeSpan.Zero,
            arguments: Array.Empty<byte>(),
            ttl: TimeSpan.FromMinutes(1),
            overwrite: true,
            cancellationToken: cancellationToken);
    }

    public async Task ClearAlarms(CancellationToken cancellationToken = default)
    {
        var deviceIds = await GetRegisteredDevices(cancellationToken);

        foreach (var deviceId in deviceIds)
        {
            await CreateDevice(deviceId).ClearAlarm(cancellationToken);
        }
    }

    private ValueTask<IActorState<ControllerState>> GetControllerState(CancellationToken cancellationToken) =>
        State.GetOrCreateAsync(
            ControllerStateName,
            static () => new ControllerState(),
            cancellationToken);

    private ISmartDeviceActor CreateDevice(string deviceId) =>
        proxies.Create<ISmartDeviceActor>(ActorId.Create(deviceId), "SmokeDetector");
}
