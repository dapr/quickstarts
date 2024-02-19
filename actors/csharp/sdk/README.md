# Dapr Actors (Dapr SDK)

Let's take a look at the Dapr [Actors building block](https://docs.dapr.io/developing-applications/building-blocks/actors/actors-overview/). In this Quickstart, you will run a SmartDevice.Service microservice and a simple console client to demonstrate the stateful object patterns in Dapr Actors.  
1. Using a SmartDevice.Service microservice, developers can host two SmartDectectorActor smoke alarm objects, and a third ControllerActor object that command and controls the smart devices.  
2. Using a SmartDevice.Client console app, developers have a client app to interact with each actor, or the controller to perform actions in aggregate. 
3. The SmartDevice.Interfaces contains the shared interfaces and data types used by both service and client apps

**Note:** This example leverages the Dapr client SDK.  


### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET 7 SDK](https://dotnet.microsoft.com/download).
- Docker Desktop

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/workflows).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 3: Run the service app

In a new terminal window, navigate to the `actors/csharp/sdk/service` directory and restore dependencies:


Run the `SmartDevice.Service`, which will start service itself and the Dapr sidecar:

<!-- STEP
name: Run actor service
expected_stdout_lines:
  - "Request finished HTTP/1.1 GET http://127.0.0.1:5001/healthz - 200"
expected_stderr_lines:
working_dir: .
output_match_mode: substring
background: true
sleep: 30
-->
```bash
cd service
dapr run --app-id actorservice --app-port 5001 --app-protocol http --dapr-http-port 56001 --resources-path ../../../resources -- dotnet run --urls=http://localhost:5001/
```
<!-- END_STEP -->

Expected output:

```bash
== APP == info: Microsoft.AspNetCore.Hosting.Diagnostics[1]
== APP ==       Request starting HTTP/1.1 GET http://127.0.0.1:5001/healthz - -
== APP == info: Microsoft.AspNetCore.Routing.EndpointMiddleware[0]
== APP ==       Executing endpoint 'Dapr Actors Health Check'
== APP == info: Microsoft.AspNetCore.Routing.EndpointMiddleware[1]
== APP ==       Executed endpoint 'Dapr Actors Health Check'
== APP == info: Microsoft.AspNetCore.Hosting.Diagnostics[2]
== APP ==       Request finished HTTP/1.1 GET http://127.0.0.1:5001/healthz - - - 200 - text/plain 5.2599ms
```

### Step 4: Run the client app

In a new terminal instance, navigate to the `actors/csharp/sdk/client` directory and install the dependencies:

Then run the client app:
<!-- STEP
name: Run actor client
expected_stdout_lines:
  - "Device 2 state: Location: Second Floor, Status: Ready"
expected_stderr_lines:
working_dir: .
output_match_mode: substring
background: true
sleep: 60
-->
```bash
cd client
dapr run --app-id actorclient -- dotnet run
```
<!-- END_STEP -->

Expected output:

```bash
== APP == Startup up...
== APP == Calling SetDataAsync on SmokeDetectorActor:1...
== APP == Got response: Success
== APP == Calling GetDataAsync on SmokeDetectorActor:1...
== APP == Device 1 state: Location: First Floor, Status: Ready
== APP == Calling SetDataAsync on SmokeDetectorActor:2...
== APP == Got response: Success
== APP == Calling GetDataAsync on SmokeDetectorActor:2...
== APP == Device 2 state: Location: Second Floor, Status: Ready
== APP == Registering the IDs of both Devices...
== APP == Registered devices: 1, 2
== APP == Detecting smoke on Device 1...
== APP == Device 1 state: Location: First Floor, Status: Alarm
== APP == Device 2 state: Location: Second Floor, Status: Alarm
== APP == Sleeping for 16 seconds before checking status again to see reminders fire and clear alarms
== APP == Device 1 state: Location: First Floor, Status: Ready
== APP == Device 2 state: Location: Second Floor, Status: Ready
```

### Cleanup

<!-- STEP
expected_stdout_lines: 
  - '✅  app stopped successfully: actorservice'
expected_stderr_lines:
name: Shutdown dapr
-->

```bash
dapr stop --app-id  actorservice
(lsof -iTCP -sTCP:LISTEN -P | grep :5001) | awk '{print $2}' | xargs  kill
```

<!-- END_STEP -->

### What happened

When you ran the client app:

1. Two `SmartDetectorActor` actors are created and initialized with Id, Location, and Status="Ready"
2. The `DetectSmokeAsync` method of `SmartDetectorActor` 1 is called.
3. The `TriggerAlarmForAllDetectors` method of `ControllerActor` is called.
4. The `SoundAlarm` methods of `SmartDetectorActor` 1 and 2 are called.
5. The `ControllerActor` also creates a reminder to `ClearAlarm` after 15 seconds using `RegisterReminderAsync`


Looking at the code, `SmartDetectorActor` objects are created in the client application and initialized with object state with `ActorProxy.Create<ISmartDevice>(actorId, actorType)` and then `proxySmartDevice.SetDataAsync(data)`.  These objects are re-entrant and will hold on to the state as shown by `proxySmartDevice.GetDataAsync()`.

```cs
        // Actor Ids and types
        var deviceId1 = "1";
        var deviceId2 = "2";
        var smokeDetectorActorType = "SmokeDetectorActor";
        var controllerActorType = "ControllerActor";

        Console.WriteLine("Startup up...");

        // An ActorId uniquely identifies an actor instance
        var deviceActorId1 = new ActorId(deviceId1);

        // Create the local proxy by using the same interface that the service implements.
        // You need to provide the type and id so the actor can be located. 
        // If the actor matching this id does not exist, it will be created
        var proxySmartDevice1 = ActorProxy.Create<ISmartDevice>(deviceActorId1, smokeDetectorActorType);

        // Create a new instance of the data class that will be stored in the actor
        var deviceData1 = new SmartDeviceData(){
            Location = "First Floor",
            Status = "Ready",
        };

        // Now you can use the actor interface to call the actor's methods.
        Console.WriteLine($"Calling SetDataAsync on {smokeDetectorActorType}:{deviceActorId1}...");
        var setDataResponse1 = await proxySmartDevice1.SetDataAsync(deviceData1);
        Console.WriteLine($"Got response: {setDataResponse1}");
```

The `ControllerActor` object is used to keep track of the devices and trigger the alarm for all of them.

```csharp
        var controllerActorId = new ActorId("controller");
        var proxyController = ActorProxy.Create<IController>(controllerActorId, controllerActorType);

        Console.WriteLine($"Registering the IDs of both Devices...");
        await proxyController.RegisterDeviceIdsAsync(new string[]{deviceId1, deviceId2});
        var deviceIds = await proxyController.ListRegisteredDeviceIdsAsync();
        Console.WriteLine($"Registered devices: {string.Join(", " , deviceIds)}");
```

The `ControllerActor` internally triggers all alarms when smoke is detected, and then sets a reminder to clear all alarm states after 15 seconds.

```cs
    public async Task TriggerAlarmForAllDetectors()
    {
        var deviceIds =  await ListRegisteredDeviceIdsAsync();
        foreach (var deviceId in deviceIds)
        {
            // Sound the alarm on all devices
            var actorId = new ActorId(deviceId);
            var proxySmartDevice = ProxyFactory.CreateActorProxy<ISmartDevice>(actorId, "SmokeDetectorActor");
            await proxySmartDevice.SoundAlarm();
        }

        // Register a reminder to refresh and clear alarm state every 15 seconds
        await this.RegisterReminderAsync("AlarmRefreshReminder", null, TimeSpan.FromSeconds(15), TimeSpan.FromSeconds(15));
    }
```

Additionally look at:

- `SmartDevice.Service/SmartDetectorActor.cs` which contains the implementation of the the smart device actor actions
- `SmartDevice.Service/ControllerActor.cs` which contains the implementation of the controller actor that manages all devices
- `SmartDevice.Interfaces/ISmartDevice` which contains the required actions and shared data types for each SmartDetectorActor
- `SmartDevice.Interfaces/IController` which contains the actions a controller can perform across all devices
