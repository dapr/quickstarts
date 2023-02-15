# Quickstart: Actors (Dapr SDK) **In Development

Let's take a look at the Dapr [Actors building block](https://docs.dapr.io/developing-applications/building-blocks/actors/actors-overview/). In this Quickstart, you'll use a service app (ASP.NET project) and a client app (Console project) to demonstrate Dapr's Actors API to work with stateful objects. The service app represents the digital twin for a smart device, a "smart smoke detector", that has state including a location and a status. The client app will be used to interact with the actors.

> **Note:** This example leverages the Dapr client SDK.  

Dapr actors are so-called virtual actors. As soon as you call an actor method, the actor is activated and the method is executed. The actor is deactivated after a configurable period of time (idle timeout). Any state that belongs to the actor is persisted in a state store. So if you call the same actor after the idle timeout, the actor is reactivated and the state is restored.

The Quickstart consists of three projects:

- `SmartDevice.Service` is an ASP.NET application that contains the `SmartDetectorActor` and the `ControllerActor`.
- `SmartDevice.Client` is a console application that calls the `SmartDetectorActor` and the `ControllerActor`.
- `SmartDevice.Interfaces` contains the interfaces and data types used by the Service and Client projects.

In this guide you'll:

- Run the service app
- Run the client app
- Review the code of the apps to understand how they work

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET SDK or .NET 6 SDK installed](https://dotnet.microsoft.com/download).
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/workflows).

```bash
git clone https://github.com/dapr/quickstarts.git
```

In a new terminal window, navigate to the `actors/csharp/sdk/service` directory:

```bash
cd actors/csharp/sdk/service
```

### Step 3: Run the service app

Build the `SmartDevice.Service` project and install the dependencies:

```bash
dotnet build
```

Run the `SmartDevice.Service`, which will start the Dapr sidecar and the service itself:

```bash
dapr run --app-id myapp --app-port 5001 --dapr-http-port 3500 --components-path ../../../resources -- dotnet run --urls=http://localhost:5001/
```

This starts the `SmartDevice.Service` app with unique workflow ID and runs the workflow activities. 

Expected output:

// TODO

### Step 4: Run the client app

In another terminal instance, navigate to the `actors/csharp/sdk/client` directory and install the dependencies:

```bash
cd ./actors/csharp/sdk/client
dotnet build
```

Run the `SmartDevice.Client` app:

```bash
dotnet run
```

### What happened

When you ran `dotnet run` for the client app:

1. A `SmartDetectorActor` is created with these properties: Id = 1, Location = "First Floor", Status = "Ready".
2. Another `SmartDetectorActor` is created with these properties: Id = 2, Location = "Second Floor", Status = "Ready".
3. The status of `SmartDetectorActor` 1 is read and printed to the console.
4. The `DetectSmoke` method of `SmartDetectorActor` 1 is called.
5. The `SignalAlarm` method of `ControllerActor` is called.
6. The `SignalAlarm` method of `SmartDetectorActor` 1 is called.
7. The `SignalAlarm` method of `SmartDetectorActor` 2 is called.
8. The status of `SmartDetectorActor` 1 and 2 is read and printed to the console.

#### `service/SmartDetectorActor.cs`

// TODO

#### `service/ControllerActor.cs`

// TODO

#### `service/Program.cs`

// TODO

#### `client/Program.cs`

// TODO

---

> **Note:** This example leverages the Dapr SDK.  

This quickstart includes three services and some common interfaces:
 
- .NET/C# service `SmokeDetectorActor:1`
- .NET/C# service `SmokeDetectorActor:2`
- .NET/C# service `ControllerActor:singleton`
- .NET/C# interfaces `ISmartDevice`, `IController`
- .NET/C# inferface data type `SmartDeviceData`

### Run C# SmokeDetectorActor service with Dapr

1. Open a new terminal window, change directories to `./smartdevice.Service` in the quickstart directory and run: 

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

```bash
cd ./smartdevice.Service
dapr run --app-id myapp --app-port 5001 --dapr-http-port 3500 --components-path ../../../resources -- dotnet run --urls=http://localhost:5001/
```

Healthy output looks like:

```bash
== APP == info: Microsoft.AspNetCore.Hosting.Diagnostics[1]
== APP ==       Request starting HTTP/1.1 GET http://127.0.0.1:5002/healthz - -
== APP == info: Microsoft.AspNetCore.Routing.EndpointMiddleware[0]
== APP ==       Executing endpoint 'Dapr Actors Health Check'
== APP == info: Microsoft.AspNetCore.Routing.EndpointMiddleware[1]
== APP ==       Executed endpoint 'Dapr Actors Health Check'
== APP == info: Microsoft.AspNetCore.Hosting.Diagnostics[2]
== APP ==       Request finished HTTP/1.1 GET http://127.0.0.1:5002/healthz - - - 200 - text/plain 0.8972ms
```

### Work with service and actors from an external client
<!-- END_STEP -->
2. Open a new terminal window, change directories to `./smartdevice.Client` in the quickstart directory and run: 

<!-- STEP
name: Run batch-sdk service
working_dir: ./smartdevice.Client
expected_stdout_lines:
  - 'Calling SetDataAsync on SmokeDetectorActor:1'
expected_stderr_lines:
output_match_mode: substring
sleep: 11
timeout_seconds: 30
-->
    
```bash
cd ./smartdevice.Client
dotnet run
```

Healthy output looks like:

```bash
Startup up...
Calling SetDataAsync on SmokeDetectorActor:1...
Got response: Success
Calling GetDataAsync on SmokeDetectorActor:1...
Got response: Success
Smart device state: Name: First Floor, Status: Ready, Battery: 100.0, Temperature: 68.0, Location: Main Hallway, FirmwareVersion: 1.1, SerialNo: ABCDEFG1, MACAddress: 67-54-5D-48-8F-38, LastUpdate: 2/1/2023 10:38:26 PM
Calling SetDataAsync on SmokeDetectorActor:2...
Got response: Success
Calling GetDataAsync on SmokeDetectorActor:2...
Got response: Success
Smart device state: Name: Bedroom, Status: Ready, Battery: 98.0, Temperature: 72.0, Location: Bedroom, FirmwareVersion: 1.1, SerialNo: ABCDEFG2, MACAddress: 50-3A-32-AB-75-DF, LastUpdate: 2/1/2023 10:38:27 PM
Calling GetAverageTemperature on ControllerActor:singleton...
Got response: 70.0
```
<!-- END_STEP -->
