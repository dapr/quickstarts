# Dapr Actors over gRPC (Dapr Go SDK)

Let's take a look at the Dapr [Actors building block](https://docs.dapr.io/developing-applications/building-blocks/actors/actors-overview/). In this Quickstart, you will run a smart device microservice and a simple console client to demonstrate the stateful object patterns in Dapr Actors.

1. Using the `service` app, developers can host `SmokeDetectorActor` smoke alarm objects.
2. Using the `client` console app, developers have a client app to interact with each actor.
3. The `api` package contains the data type shared by both apps.

This quickstart hosts the actors over the **app-initiated gRPC actor event stream** (`SubscribeActorEventsAlpha1`): the application dials the Dapr sidecar's gRPC port, registers its actor types, and receives all actor callbacks (method invocations, reminders, timers, deactivations) over a single bidirectional stream — instead of exposing HTTP actor callback endpoints that the sidecar calls into.

> **Note:** gRPC actor hosting is in **Alpha** and requires Dapr **1.18 or later** with `--app-protocol grpc`. The actor implementation itself is identical to HTTP-hosted actors; only the hosting mechanism changes.

## How it works

When hosting actors over HTTP, the application exposes callback endpoints that the sidecar calls into (`PUT /actors/{type}/{id}/method/{method}`, `GET /dapr/config`, `GET /healthz`). With the gRPC actor event stream, the roles are reversed — the application is the gRPC client:

- The app opens one bidirectional stream to the sidecar with `client.SubscribeActorEvents`. The initial message registers the hosted actor types and their configuration (replacing `GET /dapr/config`).
- All actor callbacks arrive as messages on that stream and responses are sent back on it. No inbound port for actor callbacks is needed.
- The open stream itself is the liveness signal (replacing `GET /healthz`). If the stream drops or the sidecar restarts, the SDK reconnects and re-registers the actor types automatically.
- A gRPC app channel must still exist for the sidecar to accept the stream (`--app-protocol grpc` plus a gRPC server on the app port), but actor callbacks never reach it — they are all delivered over the stream.

## Run the quickstart

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started), with runtime version **1.18 or later**
- [Go installed](https://go.dev/doc/install) (the module requires Go 1.26+; recent Go toolchains switch automatically)
- Docker Desktop

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/actors).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 3: Run the service app

In a new terminal window, navigate to the `actors/go/sdk` directory and run the service, which hosts the `SmokeDetectorActor` actor type over the actor event stream:

<!-- STEP
name: Run actor service
expected_stdout_lines:
  - 'Actor event subscription started. Hosting SmokeDetectorActor over the actor event stream.'
  - 'Smoke detected on device 1! Status set to Alarm'
  - 'Reminder AlarmClear fired on device 1: alarm cleared, status reset to Ready'
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 30
-->

```bash
dapr run --app-id actorservice --app-protocol grpc --app-port 50051 --resources-path ../../resources -- go run ./service
```

<!-- END_STEP -->

Expected output (the actor types are now hosted over the stream):

```
Actor event subscription started. Hosting SmokeDetectorActor over the actor event stream.
```

### Step 4: Run the client app

In a new terminal instance, navigate to the `actors/go/sdk` directory and run the client:

<!-- STEP
name: Run actor client
expected_stdout_lines:
  - 'Got response: Success'
  - 'Device 1 state: Location: First Floor, Status: Ready'
  - 'Got response: Success'
  - 'Device 2 state: Location: Second Floor, Status: Ready'
  - 'Detecting smoke on Device 1...'
  - 'Device 1 state: Location: First Floor, Status: Alarm'
  - 'Device 1 state: Location: First Floor, Status: Ready'
expected_stderr_lines:
output_match_mode: substring
timeout_seconds: 120
-->

```bash
dapr run --app-id actorclient -- go run ./client
```

<!-- END_STEP -->

The client invokes actor methods with `client.InvokeActor`, addressing each actor by its type, ID, and method name, with plain JSON payloads. (The Go SDK also offers typed client stubs via `ImplActorClientStub`; see the [SDK actor example](https://github.com/dapr/go-sdk/tree/main/examples/actor) for that style.)

Expected output:

```
Calling SetData on SmokeDetectorActor:1...
Got response: Success
Calling GetData on SmokeDetectorActor:1...
Device 1 state: Location: First Floor, Status: Ready
Calling SetData on SmokeDetectorActor:2...
Got response: Success
Calling GetData on SmokeDetectorActor:2...
Device 2 state: Location: Second Floor, Status: Ready
Detecting smoke on Device 1...
Device 1 state: Location: First Floor, Status: Alarm
Sleeping for 16 seconds before checking status again to see the reminder fire and clear the alarm
Device 1 state: Location: First Floor, Status: Ready
```

### What happened

When you ran the client app:

1. Two `SmokeDetectorActor` instances ("1" and "2") were activated and initialized with a location and `Status: Ready`. Each instance keeps its own state in the actor state store.
2. The `DetectSmoke` method of device 1 set its status to `Alarm` and registered a one-shot `AlarmClear` reminder due in 15 seconds.
3. The reminder fired — delivered to the service over the actor event stream, like every other callback — and reset the status of device 1 back to `Ready`.

On the service side you can see the callbacks arriving over the stream:

```
Actor event subscription started. Hosting SmokeDetectorActor over the actor event stream.
Smoke detected on device 1! Status set to Alarm
Reminder AlarmClear fired on device 1: alarm cleared, status reset to Ready
```

### Cleanup

<!-- STEP
name: Shutdown dapr
expected_stdout_lines:
  - '✅  app stopped successfully: actorservice'
expected_stderr_lines:
output_match_mode: substring
-->

```bash
dapr stop --app-id actorservice
(lsof -iTCP -sTCP:LISTEN -P | grep :50051) | awk '{print $2}' | xargs kill || true
```

<!-- END_STEP -->
