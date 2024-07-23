using Dapr.Actors;
using Dapr.Actors.Runtime;
using SmartDevice.Interfaces;

namespace SmartDevice;

internal class SmokeDetectorActor : Actor, ISmartDevice
{
    private readonly string deviceDataKey = "device-data";

    // The constructor must accept ActorHost as a parameter, and can also accept additional
    // parameters that will be retrieved from the dependency injection container
    //
    /// <summary>
    /// Initializes a new instance of SmokeDetectorActor
    /// </summary>
    /// <param name="host">The Dapr.Actors.Runtime.ActorHost that will host this actor instance.</param>
    public SmokeDetectorActor(ActorHost host)
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
        Console.WriteLine($"Activating actor id: {this.Id}");
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

    /// <summary>
    /// Set MyData into actor's private state store
    /// </summary>
    /// <param name="data">the user-defined MyData which will be stored into state store as "device_data" state</param>
    public async Task<string> SetDataAsync(SmartDeviceData data)
    {
        // This set state action can happen along other state changing operations in each actor method and those changes will be maintained
        // in a local cache to be committed as a single transaction to the backing store when the method has completed. As such, there is 
        // no need to (and in fact makes your code less transactional) call `this.StateManager.SaveStateAsync()` as it will be automatically
        // invoked by the actor runtime following the conclusion of this method as part of the internal `OnPostActorMethodAsyncInternal` method.

        // Note also that all saved state must be DataContract serializable.
        await StateManager.SetStateAsync<SmartDeviceData>(
            deviceDataKey,
            data);

        return "Success";
    }

    /// <summary>
    /// Get MyData from actor's private state store
    /// </summary>
    /// <return>the user-defined MyData which is stored into state store as "my_data" state</return>
    public async Task<SmartDeviceData> GetDataAsync()
    {
        // Gets current state from the state store.
        return await StateManager.GetStateAsync<SmartDeviceData>(deviceDataKey);
    }

    public async Task DetectSmokeAsync()
    {
        var controllerActorId = new ActorId("controller");
        var controllerActorType = "ControllerActor";
        var controllerProxy = ProxyFactory.CreateActorProxy<IController>(controllerActorId, controllerActorType);
        await controllerProxy.TriggerAlarmForAllDetectors();
    }

    public async Task SoundAlarm()
    {
        var smartDeviceData = await GetDataAsync();
        smartDeviceData.Status = "Alarm";
        await SetDataAsync(smartDeviceData);
    }

    public async Task ClearAlarm()
    {
        var smartDeviceData = await GetDataAsync();
        smartDeviceData.Status = "Ready";
        await SetDataAsync(smartDeviceData);
    }
}
