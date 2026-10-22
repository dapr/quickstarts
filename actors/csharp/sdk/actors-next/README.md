# Dapr Actors (`Dapr.Actors.Next` SDK)

This quickstart demonstrates the [Dapr Actors building block](https://docs.dapr.io/developing-applications/building-blocks/actors/actors-overview/) with the modern [`Dapr.Actors.Next`](https://docs.dapr.io/developing-applications/sdks/dotnet/dotnet-actors-next/) .NET package.

The app creates two smoke detector actors and a controller actor. It demonstrates generated actor clients, actor state, actor-to-actor calls, and a durable reminder that clears an alarm. Unlike the [legacy .NET actors quickstart](../actors/README.md), actor discovery and dispatch are source-generated, dependencies use standard dependency injection, and no actor HTTP handlers need to be mapped.

All three projects are local to this directory:

- [`client/SmartDevice.Client.csproj`](client/SmartDevice.Client.csproj) is a console app that initializes the devices, triggers their alarms, and checks that the reminder clears them.
- [`interfaces/SmartDevice.Interfaces.csproj`](interfaces/SmartDevice.Interfaces.csproj) contains the shared actor contracts, generated clients, and data types used by the client and service.
- [`service/SmartDevice.Service.csproj`](service/SmartDevice.Service.csproj) hosts the smoke detector and controller actors.

Open `sdk.sln` to work with all three projects together.

## Prerequisites

- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/) with a local environment initialized by `dapr init`
- Dapr runtime 1.19 or later
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- Docker or another supported container runtime

## Run with the multi-app template

Run the following commands from `actors/csharp/sdk/actors-next`. First, restore and build all three projects:

<!-- STEP
name: Build actor projects
expected_stdout_lines:
  - "Build succeeded."
expected_stderr_lines:
output_match_mode: substring
-->

```bash
dotnet build ./sdk.sln
```

<!-- END_STEP -->

Start the app and its Dapr sidecar. Port `5001` serves the HTTP API used in this walkthrough, while port `5056` is the HTTP/2 app channel used by the Dapr actor event stream.

<!-- STEP
name: Run actor service
expected_stdout_lines:
  - "Now listening on: http://localhost:5001"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 30
timeout_seconds: 120
-->

```bash
dapr run -f .
```

<!-- END_STEP -->

In a second terminal in the same directory, run the console client with its own Dapr sidecar. The client uses the local interfaces project to call the actors hosted by the service:

<!-- STEP
name: Run actor client
expected_stdout_lines:
  - "Registered devices: 1, 2"
  - "Device 1 state: Location: First Floor, Status: Ready"
  - "Device 2 state: Location: Second Floor, Status: Ready"
  - "Detecting smoke on Device 1..."
  - "Device 1 state: Location: First Floor, Status: Alarm"
  - "Device 2 state: Location: Second Floor, Status: Alarm"
  - "Waiting for the reminder to clear alarms..."
  - "Device 1 state: Location: First Floor, Status: Ready"
  - "Device 2 state: Location: Second Floor, Status: Ready"
expected_stderr_lines:
output_match_mode: substring
timeout_seconds: 60
-->

```bash
dapr run --app-id smart-device-client-next-sdk --resources-path ../../../resources -- dotnet run --project ./client/SmartDevice.Client.csproj
```

<!-- END_STEP -->

The client initializes two smoke detectors and registers them with the controller. It then detects smoke on the first device, which calls the controller to sound the other device's alarm and schedule a durable reminder. After waiting ten seconds, the client checks that both devices are ready again. The client and its sidecar exit when it finishes.

Stop the app and sidecar:

<!-- STEP
name: Stop actor service
expected_stdout_lines:
expected_stderr_lines:
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->

## What happened

`[GenerateActorClient]` marks each actor contract for source generation, while `[DaprActor]` marks its implementation. `AddDaprActors()` discovers both actor types at build time and starts the gRPC actor event stream; there is no `MapActorsHandlers()` call or manual type registration.

With SDK 1.19.0, host dispatch generation requires a contract declared in the service assembly. The service therefore declares two empty `IHosted...` interfaces that inherit the shared contracts. They add no operations; the client still uses the contracts from the local interfaces project.

The console client resolves `IActorProxyFactory` from dependency injection and uses the generated clients from `SmartDevice.Interfaces` to call actors. Both the client and service reference `../interfaces/SmartDevice.Interfaces.csproj` within this quickstart; neither depends on the legacy sample. Each actor receives its identity and state through `ActorActivationContext`, and mutations to `state.Value` are persisted automatically at the end of the actor turn.

When device `1` detects smoke, it changes its own state and calls the controller. The controller calls the other smoke detectors and then schedules `ClearAlarms` with `IActorReminderScheduler`, so Dapr durably invokes it five seconds later.
