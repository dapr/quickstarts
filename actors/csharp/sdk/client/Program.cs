using Dapr.Actors;
using Dapr.Actors.Client;
using SmartDevice.Interfaces;

namespace SmartDevice;

class Program
{
    static async Task Main(string[] args)
    {
        Console.WriteLine("Startup up...");

        // Registered Actor Type in Actor Service
        var actorType = "SmokeDetectorActor";

        // An ActorId uniquely identifies an actor instance
        // If the actor matching this id does not exist, it will be created
        var actorId = new ActorId("1");

        // Create the local proxy by using the same interface that the service implements.
        // You need to provide the type and id so the actor can be located. 
        var proxySmartDevice = ActorProxy.Create<ISmartDevice>(actorId, actorType);

        // Now you can use the actor interface to call the actor's methods.
        var data = new SmartDeviceData(){
            Location = "First Floor",
            Status = "Ready",
            Battery = 100.0M,
            Temperature = 68.0M,
        };
        Console.WriteLine($"Calling SetDataAsync on {actorType}:{actorId}...");
        var response = await proxySmartDevice.SetDataAsync(data);
        Console.WriteLine($"Got response: {response}");

        Console.WriteLine($"Calling GetDataAsync on {actorType}:{actorId}...");
        var savedData = await proxySmartDevice.GetDataAsync();
        Console.WriteLine($"Got response: {response}");
        Console.WriteLine($"Smart device state: {savedData.ToString()}");

        // Create a second actor for second device
        actorId = new ActorId("2");
        data = new SmartDeviceData(){
            Location = "Second Floor",
            Status = "Ready",
            Battery = 98.0M,
            Temperature = 72.0M,
        };
        Console.WriteLine($"Calling SetDataAsync on {actorType}:{actorId}...");
        response = await proxySmartDevice.SetDataAsync(data);
        Console.WriteLine($"Got response: {response}");
        Console.WriteLine($"Calling GetDataAsync on {actorType}:{actorId}...");
        savedData = await proxySmartDevice.GetDataAsync();
        Console.WriteLine($"Got response: {response}");
        Console.WriteLine($"Smart device state: {savedData.ToString()}");

        // Show aggregates using controller together with smart devices
        actorId = new ActorId("singleton");
        actorType = "ControllerActor";
        var proxyController = ActorProxy.Create<IController>(actorId, actorType);

        Console.WriteLine($"Calling GetAverageTemperature on {actorType}:{actorId}...");
        var avgTemp = await proxyController.GetAverageTemperature();

        Console.WriteLine($"Got response: {avgTemp}");
    }
}
