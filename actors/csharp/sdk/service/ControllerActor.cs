using Dapr.Actors;
using Dapr.Actors.Runtime;
using SmartDevice.Interfaces;

namespace SmartDevice;

internal class ControllerActor : Actor, IController
{
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
    /// Set MyData into actor's private state store
    /// </summary>
    /// <param name="data">the user-defined MyData which will be stored into state store as "my_data" state</param>
    public async Task<decimal> GetNetBatteryPercentage()
    {
        // Data is saved to configured state store implicitly after each method execution by Actor's runtime.
        // Data can also be saved explicitly by calling this.StateManager.SaveStateAsync();
        // State to be saved must be DataContract serializable.

        // TODO: await & fetch all battery values and return aggregate
        await Task.Delay(1000);

        return 100.0M;
    }

    /// <summary>
    /// Get MyData from actor's private state store
    /// </summary>
    /// <return>the user-defined MyData which is stored into state store as "my_data" state</return>
    public async Task<decimal> GetAverageTemperature()
    {
        // TODO: await & fetch and average the temperatures
        await Task.Delay(1000);

        return 70.0M;
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
        Console.WriteLine($"Deactivating actor id: {this.Id}");
        return Task.CompletedTask;
    }

    public async Task RegisterDeviceIdsAsync(string[] deviceIds)
    {
        await this.StateManager.SetStateAsync<string[]>("deviceIds", deviceIds);
    }

    public async Task<string[]> ListRegisteredDeviceIdsAsync()
    {
        return await this.StateManager.GetStateAsync<string[]>("deviceIds");
    }

    public async Task TriggerAlarmForAllDetectors()
    {
        var data =  await StateManager.GetStateAsync<ControllerData>("controllerData");
        foreach (var deviceId in data.DeviceIds)
        {
            var actorId = new ActorId(deviceId);
            var proxySmartDevice = ProxyFactory.CreateActorProxy<ISmartDevice>(actorId, "SmokeDetectorActor");
            await proxySmartDevice.SoundAlarm();
        }
    }
}
