using Dapr.Actors;
using Dapr.Actors.Runtime;
using SmartDevice.Interfaces;

namespace SmartDevice;

internal class SmokeDetectorActor : Actor, ISmartDevice
{
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
        // Provides Opporunity to perform optional cleanup.
        Console.WriteLine($"Deactivating actor id: {this.Id}");
        return Task.CompletedTask;
    }

    /// <summary>
    /// Set MyData into actor's private state store
    /// </summary>
    /// <param name="data">the user-defined MyData which will be stored into state store as "my_data" state</param>
    public async Task<string> SetDataAsync(SmartDeviceData data)
    {
        // Data is saved to configured state store implicitly after each method execution by Actor's runtime.
        // Data can also be saved explicitly by calling this.StateManager.SaveStateAsync();
        // State to be saved must be DataContract serializable.
        await StateManager.SetStateAsync<SmartDeviceData>(
            "my_data",  // state name
            data);      // data saved for the named state "my_data"

        return "Success";
    }

    /// <summary>
    /// Get MyData from actor's private state store
    /// </summary>
    /// <return>the user-defined MyData which is stored into state store as "my_data" state</return>
    public async Task<SmartDeviceData> GetDataAsync()
    {
        // Gets state from the state store.
        return await StateManager.GetStateAsync<SmartDeviceData>("my_data");
    }

    public async Task DetectSmokeAsync()
    {
        // TODO: Set Status to "Alarm"
        var controllerActorId = new ActorId("controller");
        var controllerActorType = "ControllerActor";
        var controllerProxy = ProxyFactory.CreateActorProxy<IController>(controllerActorId, controllerActorType);
        await controllerProxy.TriggerAlarmForAllDetectors();
    }

    public Task SoundAlarm()
    {
        Console.WriteLine($"ActorId: {this.Id} is sounding the alarm");
        return Task.CompletedTask;
    }
}
