# Dapr Actors (Dapr SDK) **In Development

In this quickstart, you'll create an Actor service to demonstrate Dapr's Actors API to work stateful objects. The service represents the digital twin for a smart device, a "smart smoke detector", that has state including alarm status, battery, and firmware version.  Multiple Actors can have interactions like signaling an alarm to the others.  There is also a Controller actor that can query for all status, battery, and perform calculations like % of devices with low battery.  

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/actors/actors-overview/) link for more information about Dapr and Actors.

> **Note:** This example leverages the Dapr SDK.  

This quickstart includes three services and some common interfaces:
 
- .NET/C# service `SmokeDetectorActor:1`
- .NET/C# service `SmokeDetectorActor:2`
- .NET/C# service `ControllerActor:singleton`
- .NET/C# interfaces `ISmartDevice`, `IController`
- .NET/C# inferface data type `SmartDeviceData`

### Run C# SmartDetectorActor service with Dapr

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
Smart device state: Name: First Floor, Status: Ready, Battery: 100.0, Temperature: 68.0,Location: Main Hallway, FirmwareVersion: 1.1, SerialNo: ABCDEFG1, MACAddress: 67-54-5D-48-8F-38, LastUpdate: 2/1/2023 10:38:26 PM
Calling SetDataAsync on SmokeDetectorActor:2...
Got response: Success
Calling GetDataAsync on SmokeDetectorActor:2...
Got response: Success
Smart device state: Name: Bedroom, Status: Ready, Battery: 98.0, Temperature: 72.0,Location: Bedroom, FirmwareVersion: 1.1, SerialNo: ABCDEFG2, MACAddress: 50-3A-32-AB-75-DF, LastUpdate: 2/1/2023 10:38:27 PM
Calling GetAverageTemperature on ControllerActor:singleton...
Got response: 70.0
```
<!-- END_STEP -->
