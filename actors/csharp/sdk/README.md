# Quickstart: Actors (Dapr SDK) **In Development

Let's take a look at the Dapr [Actors building block](https://docs.dapr.io/developing-applications/building-blocks/actors/actors-overview/). In this Quickstart, you will run a SmartDevice.Service microservice and a simple console client to demonstrate the stateful object patterns in Dapr Actors.  
1. Using a SmartDevice.Service microservice, developers can host two SmartDectectorActor smoke alarm objects, and a third ControllerActor object that command and controls the smart devices.  
2. Using a SmartDevice.Client console app, developers have a client app to interact with each actor, or the controller to perform actions in aggregate. 
3. The SmartDevice.Interfaces contains the shared interfaces and data types used by both service and client apps

> **Note:** This example leverages the Dapr client SDK.  


### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET 7 SDK](https://dotnet.microsoft.com/download).
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/workflows).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 3: Run the service app

In a new terminal window, navigate to the `actors/csharp/sdk/service` directory and restore dependencies:

```bash
cd actors/csharp/sdk/service
dotnet build
```

Run the `SmartDevice.Service`, which will start service itself and the Dapr sidecar:

```bash
dapr run --app-id actorservice --app-port 5001 --dapr-http-port 3500 --components-path ../../../resources -- dotnet run --urls=http://localhost:5001/
```

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

```bash
cd ./actors/csharp/sdk/client
dotnet build
```

Run the `SmartDevice.Client` app:

```bash
dapr run --app-id actorclient -- dotnet run
```

Expected output:

```bash
== APP == Startup up...
== APP == Calling SetDataAsync on SmokeDetectorActor:1...
== APP == Got response: Success
== APP == Calling GetDataAsync on SmokeDetectorActor:1...
== APP == Got response: Success
== APP == Smart device state: Name: First Floor, Status: Ready, Battery: 100.0, Temperature: 68.0, Location: Main Hallway, FirmwareVersion: 1.1, SerialNo: ABCDEFG1, MACAddress: 67-54-5D-48-8F-38, LastUpdate: 3/3/2023 9:36:17 AM
== APP == Calling SetDataAsync on SmokeDetectorActor:2...
== APP == Got response: Success
== APP == Calling GetDataAsync on SmokeDetectorActor:2...
== APP == Got response: Success
== APP == Smart device state: Name: Bedroom, Status: Ready, Battery: 98.0, Temperature: 72.0, Location: Bedroom, FirmwareVersion: 1.1, SerialNo: ABCDEFG2, MACAddress: 50-3A-32-AB-75-DF, LastUpdate: 3/3/2023 9:36:17 AM
== APP == Calling GetAverageTemperature on ControllerActor:singleton...
== APP == Got response: 70.0
```

### What happened

When you ran the client app:

1. A `SmartDetectorActor` is created with these properties: Id = 1, Location = "First Floor", Status = "Ready".
2. Another `SmartDetectorActor` is created with these properties: Id = 2, Location = "Second Floor", Status = "Ready".
3. The status of `SmartDetectorActor` 1 is read and printed to the console.
4. The `DetectSmoke` method of `SmartDetectorActor` 1 is called.
5. The `SignalAlarm` method of `ControllerActor` is called.
6. The `SignalAlarm` method of `SmartDetectorActor` 1 is called.
7. The `SignalAlarm` method of `SmartDetectorActor` 2 is called.
8. The `ControllerActor` is called which aggregates average temperature status of `SmartDetectorActor:1` and `SmartDetectorActor:2`.


Looking at the code, `SmartDetectorActor` objects are created in the client application and initialized with object state with `ActorProxy.Create<ISmartDevice>(actorId, actorType)` and then `proxySmartDevice.SetDataAsync(data)`.  These objects are re-entrant and will hold on to the state as shown by `proxySmartDevice.GetDataAsync()`.

```csharp
        var actorId = new ActorId("1");

        // Create the local proxy by using the same interface that the service implements.
        // You need to provide the type and id so the actor can be located. 
        var proxySmartDevice = ActorProxy.Create<ISmartDevice>(actorId, actorType);

        // Now you can use the actor interface to call the actor's methods.
        var data = new SmartDeviceData(){
            Name = "First Floor",
            Status = "Ready",
            Battery = 100.0M,
            Temperature = 68.0M,
            Location = "Main Hallway",
            FirmwareVersion = 1.1M,
            SerialNo = "ABCDEFG1",
            MACAddress = "67-54-5D-48-8F-38",
            LastUpdate = DateTime.Now
        };

        Console.WriteLine($"Calling SetDataAsync on {actorType}:{actorId}...");
        var response = await proxySmartDevice.SetDataAsync(data);
        Console.WriteLine($"Got response: {response}");

        Console.WriteLine($"Calling GetDataAsync on {actorType}:{actorId}...");
        var savedData = await proxySmartDevice.GetDataAsync();
        Console.WriteLine($"Got response: {response}");

        Console.WriteLine($"Smart device state: {savedData.ToString()}");
```

The `ControllerActor` object is used to make aggregate calls to the other actors.

```csharp
        // Show aggregates using controller together with smart devices
        actorId = new ActorId("singleton");
        actorType = "ControllerActor";
        var proxyController = ActorProxy.Create<IController>(actorId, actorType);

        Console.WriteLine($"Calling GetAverageTemperature on {actorType}:{actorId}...");
        var avgTemp = await proxyController.GetAverageTemperature();

        Console.WriteLine($"Got response: {avgTemp}");
```

Additionally look at:
- `smartdevice.Service/SmartDetectorActor.cs` which contains the implementation of the the smart device actor actions and timers
- `smartdevice.Service/ControllerActor.cs` which contains the implementation of the controller actor that can aggregate across smart devices
- `smartdevice.Interfaces/ISmartDevice` which contains the required actions and shared data types for each SmartDectorActor
- `smartdevice.Interfaces/IController` which contains the actions a controller can perform across all devices
---


<!-- STEP
name: Run smart-detector-actor service
working_dir: ./smartdevice.Service
expected_stdout_lines:
  - '== APP ==       Now listening on: http://localhost:5000'
expected_stderr_lines:
output_match_mode: substring
sleep: 11
timeout_seconds: 30
-->
