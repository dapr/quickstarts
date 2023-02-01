# Dapr Actors (Dapr SDK) **In Development

In this quickstart, you'll create an Actor service to demonstrate Dapr's Actors API to work stateful objects. The service represents the digital twin for a smart device, a "smart smoke detector", that has state including alarm status, battery, and firmware version.  Multiple Actors can have interactions like signaling an alarm to the others.  There is also a Controller actor that can query for all status, battery, and perform calculations like % of devices with low battery.  

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/actors/actors-overview/) link for more information about Dapr and Actors.

> **Note:** This example leverages the Dapr SDK.  

This quickstart includes one service:
 
- .NET/C# service `SmartDetectorActor`

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

<!-- END_STEP -->
3. Open a new terminal window, change directories to `./smartdevice.Client` in the quickstart directory and run: 

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

<!-- END_STEP -->
