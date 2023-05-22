using Dapr.Actors;
using Dapr.Actors.Runtime;
using SmartDevice.Interfaces;

namespace SmartDevice;

internal class ControllerActor : Actor, IController, IRemindable
{
    private readonly string deviceIdsKey = "device-ids";

    // The constructor must accept ActorHost as a parameter, and can also accept additional
    // parameters that will be retrieved from the dependency injection container
    //
    /// <summary>
    /// Initializes a new instance of SmokeDetectorActor
    /// </summary>
    /// <param name="host">The Dapr.Actors.Runtime.ActorHost that will host this actor instance.</param>
    public ControllerActor(ActorHost host)
        : base(host)
    {
    }

    /// <summary>
    /// This method is called whenever an actor is activated.
    /// An actor is activated the first time any of its methods are invoked.
    /// </summary>
    protected override Task OnActivateAsync()
    {
        // Provides opportunity to perform some optional setup.
        Console.WriteLine($"Activating actor id: {Id}");
        return Task.CompletedTask;
    }

    /// <summary>
    /// This method is called whenever an actor is deactivated after a period of inactivity.
    /// </summary>
    protected override Task OnDeactivateAsync()
    {
        // Provides opportunity to perform optional cleanup.
        Console.WriteLine($"Deactivating actor id: {Id}");
        return Task.CompletedTask;
    }

    public async Task RegisterDeviceIdsAsync(string[] deviceIds)
    {
        await this.StateManager.SetStateAsync<string[]>(deviceIdsKey, deviceIds);
    }

    public async Task<string[]> ListRegisteredDeviceIdsAsync()
    {
        return await this.StateManager.GetStateAsync<string[]>(deviceIdsKey);
    }

    public async Task TriggerAlarmForAllDetectors()
    {
        var deviceIds =  await ListRegisteredDeviceIdsAsync();
        foreach (var deviceId in deviceIds)
        {
            var actorId = new ActorId(deviceId);
            var proxySmartDevice = ProxyFactory.CreateActorProxy<ISmartDevice>(actorId, "SmokeDetectorActor");
            await proxySmartDevice.SoundAlarm();
        }

        // Register a reminder to refresh and clear alarm state every 15 seconds
        await this.RegisterReminderAsync("AlarmRefreshReminder", null, TimeSpan.FromSeconds(15), TimeSpan.FromSeconds(15));
    }

    // Callback method for all Reminders. Check the Reminder name for which timer fired.
    public async Task ReceiveReminderAsync(string reminderName, byte[] state, TimeSpan dueTime, TimeSpan period)
    {
        if (reminderName == "AlarmRefreshReminder") {
        var deviceIds =  await ListRegisteredDeviceIdsAsync();
            foreach (var deviceId in deviceIds)
            {
                var actorId = new ActorId(deviceId);
                var proxySmartDevice = ProxyFactory.CreateActorProxy<ISmartDevice>(actorId, "SmokeDetectorActor");
                await proxySmartDevice.ClearAlarm();            
            }
        }
    }
}
