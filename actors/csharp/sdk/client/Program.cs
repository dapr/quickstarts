using Dapr.Actors;
using Dapr.Actors.Client;
using SmartDevice.Interfaces;

namespace SmartDevice;

class Program
{
    static async Task Main(string[] args)
    {
        // Actor Ids and types
        var deviceId1 = "1";
        var deviceId2 = "2";
        var smokeDetectorActorType = "SmokeDetectorActor";
        var controllerActorType = "ControllerActor";

        Console.WriteLine("Startup up...");

        // An ActorId uniquely identifies an actor instance
        // If the actor matching this id does not exist, it will be created
        var deviceActorId1 = new ActorId(deviceId1);

        // Create the local proxy by using the same interface that the service implements.
        // You need to provide the type and id so the actor can be located. 
        var proxySmartDevice = ActorProxy.Create<ISmartDevice>(deviceActorId1, smokeDetectorActorType);

        // Now you can use the actor interface to call the actor's methods.
        var data1 = new SmartDeviceData(){
            Location = "First Floor",
            Status = "Ready",
        };
        Console.WriteLine($"Calling SetDataAsync on {smokeDetectorActorType}:{deviceActorId1}...");
        var setDataResponse1 = await proxySmartDevice.SetDataAsync(data1);
        Console.WriteLine($"Got response: {setDataResponse1}");

        Console.WriteLine($"Calling GetDataAsync on {smokeDetectorActorType}:{deviceActorId1}...");
        var savedData1 = await proxySmartDevice.GetDataAsync();
        Console.WriteLine($"Smart device state: {savedData1.ToString()}");

        // Create a second actor for second device
        var deviceActorId2 = new ActorId(deviceId2);
        var data2 = new SmartDeviceData(){
            Location = "Second Floor",
            Status = "Ready",
        };
        Console.WriteLine($"Calling SetDataAsync on {smokeDetectorActorType}:{deviceActorId2}...");
        var setDataResponse2 = await proxySmartDevice.SetDataAsync(data2);
        Console.WriteLine($"Got response: {setDataResponse2}");
        Console.WriteLine($"Calling GetDataAsync on {smokeDetectorActorType}:{deviceActorId2}...");
        var savedData2 = await proxySmartDevice.GetDataAsync();
        Console.WriteLine($"Smart device state: {savedData2.ToString()}");

        // Show aggregates using controller together with smart devices
        var controllerActorId = new ActorId("controller");
        var proxyController = ActorProxy.Create<IController>(controllerActorId, controllerActorType);

        Console.WriteLine($"Registering the IDs of both Devices...");
        await proxyController.RegisterDeviceIdsAsync(new string[]{deviceId1, deviceId2});
        var deviceIds = await proxyController.ListRegisteredDeviceIdsAsync();
        Console.WriteLine($"Registered devices: {string.Join(", " , deviceIds)}");

        // Smoke detected on device 1
        Console.WriteLine($"Detecting smoke on Device 1...");
        proxySmartDevice = ActorProxy.Create<ISmartDevice>(deviceActorId1, smokeDetectorActorType);
        await proxySmartDevice.DetectSmokeAsync();

        savedData1 = await proxySmartDevice.GetDataAsync();
        Console.WriteLine($"Device 1 state: {savedData1}");
    }
}
