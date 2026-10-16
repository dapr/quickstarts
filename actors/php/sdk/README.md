# Dapr Actors

In this quickstart, you'll create an actor (a `SmokeDetectorActor`) and a client that invokes it, demonstrating Dapr's virtual actor model.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/actors/) link for more information about Dapr and Actors.

> **Note:** This example leverages the [Dapr PHP SDK](https://docs.dapr.io/developing-applications/sdks/php/).

This quickstart includes two services:

- `actorservice` — hosts the `SmokeDetectorActor`
- `actorclient` — invokes the actor through its Dapr sidecar

## Run the actor service and client

Install the dependencies:

<!-- STEP
name: Install PHP dependencies
-->

```bash
composer install
```

<!-- END_STEP -->

The actor service hosts the actor and must expose Dapr's actor routes (`/dapr/config`, `/actors/...`). Because the PHP SDK's `App` serves requests through the PHP SAPI, the service runs under PHP's built-in web server. This step starts the service, then runs the client, which invokes the actor through its own Dapr sidecar:

<!-- STEP
name: Run actor service and client
expected_stdout_lines:
  - "Device 2 state: Location: Second Floor, Status: Ready"
expected_stderr_lines:
working_dir: .
output_match_mode: substring
timeout_seconds: 180
-->

```bash
cd service
dapr run --app-id actorservice --app-port 5001 --app-protocol http --dapr-http-port 56001 --resources-path ../../../resources -- php -S 127.0.0.1:5001 index.php &
service_pid=$!
sleep 10
cd ../client
dapr run --app-id actorclient -- php app.php
kill $service_pid
```

<!-- END_STEP -->

The client sets the state of device `2` (`Location: Second Floor, Status: Ready`) through the actor and reads it back:

```text
Calling setData on SmokeDetectorActor:2...
Got response: Success
Device 2 state: Location: Second Floor, Status: Ready
```
