# Quickstart: Actors (Dapr SDK) **In Development

In this quickstart, you'll use a service app (ASP.NET project) and a client app (Console project) to demonstrate Dapr's Actors API to work with stateful objects. The service app represents the digital twin for a smart device, a "smart smoke detector", that has state including a location and a status. The client app will be used to interact with the actors.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/actors/actors-overview/) link for more information about Dapr and Actors.

> **Note:** This example leverages the Dapr client SDK.  

Dapr actors are so-called virtual actors. As soon as you call an actor method, the actor is activated and the method is executed. The actor is deactivated after a configurable period of time (idle timeout). Any state that belongs to the actor is persisted in a state store. So if you call the same actor after the idle timeout, the actor is reactivated and the state is restored.

The quickstart consists of three projects:

- `SmartDevice.Service` is an ASP.NET application that contains the `SmartDetectorActor` and the `ControllerActor`.
- `SmartDevice.Client` is a console application that calls the `SmartDetectorActor` and the `ControllerActor`.
- `SmartDevice.Interfaces` contains the interfaces and data types used by the Service and Client projects.

### Run the SmartDevice.Service

1. Navigate to the directory and install the dependencies:

```bash
cd ./smartdevice.Service
dotnet build
```

2. Run the `SmartDevice.Service`, which will start the Dapr sidecar and the service itself:

  ```bash
  dapr run --app-id myapp --app-port 5001 --dapr-http-port 3500 --components-path ../../../resources -- dotnet run --urls=http://localhost:5001/
  ```

### Run the SmartDevice.Client to create SmartDetectorActors

1. In another terminal instance, navigate to the directory and install the dependencies:

```bash
cd ./smartdevice.Client
dotnet build
```

2. Run the `SmartDevice.Client`, with the following arguments to create a `SmartDetectorActor` with actorId `1`, location `First Floor`, and status `Ready`:

```bash
dotnet run -- --create 1 "First Floor" "Ready"
```

3. Run the `SmartDevice.Client` again, now with the following arguments to read the state of the `SmartDetectorActor` with actorId `1`:

```bash
dotnet run -- --read 1
```

  The response should be:

```bash
actorId: 1, location: First Floor, status: Ready
```

4. To create a second `SmartDetectorActor`, run the `SmartDevice.Client` again, with these arguments:

```bash
dotnet run -- --create 2 "Second Floor" "Ready"
```

### Run the SmartDevice.Client to trigger an alarm

When a `SmartDetectorActor` detects a fire, the other `SmartDetectorActor` should be signaled so they both sound the alarm. The `ControllerActor` is aware of all `SmartDetectorActor`s and can signal them. When `SmartDetectorActor` 1 detects a fire, it calls the `SignalAlarm` method on the `ControllerActor` which in turn calls the `SignalAlarm` method `SmartDetectorActor` 2.

1. Ensure that the `SmartDeviceService` and Dapr sidecar are still running.
2. Run the `SmartDevice.Client`, with the following arguments to trigger the alarm state of the `SmartDetectorActor` with actorId `1`:

```bash
dotnet run -- --alarm 1
```

  The log output of the `SmartDeviceService` should show that the `SignalAlarm` method was called on `SmartDetectorActor` 1 and 2:

```bash
SignalAlarm was called for actor: 1
SignalAlarm was called for actor: 2
```

3. You can also read the `status` field of the `SmartDetectorActor` 2 by running:

```bash
dotnet run -- --read 2
```

  The response should be:

```bash
actorId: 2, location: Second Floor, status: Alarm
```

### Run the SmartDevice.Client to reset all SmartDetectorActors

In case of a false alarm, the `ControllerActor` can reset the status of all `SmartDetectorActor`s to `Ready`.

1. Ensure that the `SmartDeviceService` and Dapr sidecar are still running.
2. Run the `SmartDevice.Client`, with the following arguments to trigger the reset functionality on the ControllerActor:

```bash
dotnet run -- --reset
```

  The log output of the `SmartDeviceService` should show that the `Reset` method was called on `SmartDetectorActor` 1 and 2:

```bash
Reset was called for actor: 1
Reset was called for actor: 2
```

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
