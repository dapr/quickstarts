using System;
using System.Threading.Tasks;
using Dapr.Actors;
using Dapr.Actors.Client;
using smartdevice.Interfaces;
using System.Text.Json.Serialization;

namespace smartdevice;

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
            //
            // You need to provide the type and id so the actor can be located. 
            var proxySmartDevice = ActorProxy.Create<ISmartDevice>(actorId, actorType);

            // Now you can use the actor interface to call the actor's methods.
            Console.WriteLine($"Calling SetDataAsync on {actorType}:{actorId}...");
            var data = new SmartDeviceData(){
                Name = "First Floor",
                Status = "Ready",
                Battery = 100.0M,
                Location = "Main Hallway",
                FirmwareVersion = 1.1M,
                SerialNo = "ABCDEFG1",
                MACAddress = "67-54-5D-48-8F-38",
                LastUpdate = DateTime.Now
            };
            var response = await proxySmartDevice.SetDataAsync(data);
            Console.WriteLine($"Got response: {response}");

            Console.WriteLine($"Calling GetDataAsync on {actorType}:{actorId}...");
            var savedData = await proxySmartDevice.GetDataAsync();
            Console.WriteLine($"Got response: {response}");

            // TODO: - show aggregates using controller together with smart devices
            // You need to provide the type and id so the actor can be located. 
            actorId = new ActorId("controller-singleton");
            actorType = "ControllerActor";
            // proxyController = ActorProxy.Create<IController>(actorId, actorType);

            Console.WriteLine($"Calling GetAverageTemperature on {actorType}:{actorId}...");
            //var avgTemp = await proxyController.GetAverageTemperature();
            var avgTemp = 70.0M;
            Console.WriteLine($"Got response: {avgTemp}");
        }
}
