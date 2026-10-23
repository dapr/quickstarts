# Dapr Jobs API (JavaScript SDK)

In this quickstart, you'll schedule, retrieve, and delete jobs using version **3.19.0** of the Dapr JavaScript SDK, and receive scheduled job callbacks.

Visit the [Dapr Jobs documentation](https://docs.dapr.io/developing-applications/building-blocks/jobs/) for more information about the Jobs API.

> **Note:** This example uses the Dapr SDK. For the example using HTTP requests directly, see the [HTTP quickstart](../http/).

This quickstart includes two apps:

- `job-scheduler` uses `DaprClient.jobs.schedule`, `get`, and `delete` to manage droid maintenance jobs.
- `job-service` uses `DaprServer.jobs.listen` to handle triggered jobs.

Jobs are scoped to an app ID. The scheduler connects to the **job-service sidecar on port 6280**, not its own sidecar, so callbacks are delivered to `job-service-sdk`. Handlers are registered before the server starts, and the scheduler waits for the service's sidecar using `client.start()`.

## Prerequisites

- Node.js 22 or later and npm.
- Dapr CLI and runtime 1.16 or later, initialized with `dapr init`. The local Dapr Scheduler must be running. Use `localhost` without an explicit port so the CLI selects the platform default (`50006` on Linux/macOS, `6060` on Windows).

No additional Dapr components are required. Run the following commands from `jobs/javascript/sdk`.

## Run with the multi-app template (`dapr run -f .`)

1. Install dependencies for both apps:

<!-- STEP
name: Install Node dependencies
-->

```bash
npm ci --prefix ./job-service
npm ci --prefix ./job-scheduler
```

<!-- END_STEP -->

2. Run both apps using the [multi-app run template](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/):

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Job scheduled: R2-D2'
  - 'Job retrieved: R2-D2, due in 15s, droid: R2-D2, task: Oil Change'
  - 'Job scheduled: C-3PO'
  - 'Job retrieved: C-3PO, due in 20s, droid: C-3PO, task: Limb Calibration'
  - 'Job scheduled: BB-8'
  - 'Job retrieved: BB-8, due in 60s, droid: BB-8, task: Gyroscope Check'
  - 'Job deleted: BB-8'
  - 'Starting droid: R2-D2'
  - 'Executing maintenance job: Oil Change'
  - 'Starting droid: C-3PO'
  - 'Executing maintenance job: Limb Calibration'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 45
timeout_seconds: 120
-->

```bash
dapr run -f .
```

<!-- END_STEP -->

The scheduler schedules and retrieves three jobs, then deletes `BB-8` before it is due. The `overwrite: true` option replaces any pending jobs from a previous run so the example can be rerun.

After about 15 and 20 seconds respectively, the service handles the `R2-D2` and `C-3PO` jobs:

```text
Received job request...
Starting droid: R2-D2
Executing maintenance job: Oil Change
Received job request...
Starting droid: C-3PO
Executing maintenance job: Limb Calibration
```

The deleted `BB-8` job does not trigger a callback.

3. In another terminal, stop the apps:

<!-- STEP
name: Stop multi-app run
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->

The STEP annotations above let `make validate` install dependencies, check scheduling, retrieval, deletion, and callback output, and stop the apps.

## Run the apps individually

After installing dependencies, open a terminal in `jobs/javascript/sdk/job-service` and start the service:

```bash
dapr run --app-id job-service-sdk --app-port 6200 --dapr-http-port 6280 --scheduler-host-address localhost -- npm run start
```

In another terminal in `jobs/javascript/sdk/job-scheduler`, start the scheduler:

```bash
dapr run --app-id job-scheduler-sdk --dapr-http-port 6380 -- npm run start
```

The output is the same as the multi-app example. When finished, stop the remaining service:

```bash
dapr stop --app-id job-service-sdk
```
