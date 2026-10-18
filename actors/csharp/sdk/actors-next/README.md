# Dapr Actors (`Dapr.Actors.Next` SDK)

This quickstart demonstrates the [Dapr Actors building block](https://docs.dapr.io/developing-applications/building-blocks/actors/actors-overview/) with the modern [`Dapr.Actors.Next`](https://docs.dapr.io/developing-applications/sdks/dotnet/dotnet-actors-next/) .NET package.

The app creates two smoke detector actors and a controller actor. It demonstrates generated actor clients, actor state, actor-to-actor calls, and a durable reminder that clears an alarm. Unlike the [legacy .NET actors quickstart](../actors/README.md), actor discovery and dispatch are source-generated, dependencies use standard dependency injection, and no actor HTTP handlers need to be mapped.

## Prerequisites

- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/) with a local environment initialized by `dapr init`
- Dapr runtime 1.18 or later
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- Docker or another supported container runtime

## Run with the multi-app template

First, restore and build the app:

<!-- STEP
name: Build actor service
expected_stdout_lines:
  - "Build succeeded."
expected_stderr_lines:
output_match_mode: substring
-->

```bash
dotnet build ./service/SmartDevice.Service.csproj
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

Initialize two smoke detectors and register them with the controller:

<!-- STEP
name: Initialize actors
expected_stdout_lines:
  - '[{"id":"1","location":"First Floor","status":"Ready"},{"id":"2","location":"Second Floor","status":"Ready"}]'
expected_stderr_lines:
output_match_mode: substring
-->

```bash
curl --silent --show-error --fail-with-body --request POST http://localhost:5001/setup
```

<!-- END_STEP -->

Detect smoke on the first device. The device calls the controller actor, which calls the other device actor and schedules a durable reminder to clear their alarms:

<!-- STEP
name: Trigger alarms
expected_stdout_lines:
  - '[{"id":"1","location":"First Floor","status":"Alarm"},{"id":"2","location":"Second Floor","status":"Alarm"}]'
expected_stderr_lines:
output_match_mode: substring
-->

```bash
curl --silent --show-error --fail-with-body --request POST http://localhost:5001/devices/1/detect-smoke
curl --silent --show-error --fail-with-body http://localhost:5001/devices
```

<!-- END_STEP -->

After the reminder fires, both devices return to the ready state:

<!-- STEP
name: Verify reminder
expected_stdout_lines:
  - '[{"id":"1","location":"First Floor","status":"Ready"},{"id":"2","location":"Second Floor","status":"Ready"}]'
expected_stderr_lines:
output_match_mode: substring
-->

```bash
sleep 10
curl --silent --show-error --fail-with-body http://localhost:5001/devices
```

<!-- END_STEP -->

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

The HTTP endpoints use the injected `IActorProxyFactory` to call actors. Each actor receives its identity and state through `ActorActivationContext`, and mutations to `state.Value` are persisted automatically at the end of the actor turn.

When device `1` detects smoke, it changes its own state and calls the controller. The controller calls the other smoke detectors and then schedules `ClearAlarms` with `IActorReminderScheduler`, so Dapr durably invokes it five seconds later.
