# Dapr Jobs API (HTTP Client)

In this quickstart, you'll schedule, get, and delete a job using Dapr's Job API. This API is responsible for scheduling and running jobs at a specific time or interval.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/jobs/) link for more information about Dapr and the Jobs API.


This quickstart includes two apps:

- `job-scheduler/app.py`, responsible for scheduling, retrieving and deleting jobs.
- `job-service/app.py`, responsible for handling the triggered jobs.

## Prerequisites

- [Python 3.8+](https://www.python.org/downloads/)
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- [Initialized Dapr environment](https://docs.dapr.io/getting-started/install-dapr-selfhost/)

## Install dependencies

```bash
pip install -r requirements.txt
```

## Run all apps with multi-app run template file

This section shows how to run both applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`. This enables you to test the interactions between multiple applications and will `schedule`, `run`, `get`, and `delete` jobs within a single process.

Open a new terminal window and run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - '== APP - job-service == Received job request...'
  - '== APP - job-service == Executing maintenance job: Oil Change'
  - '== APP - job-scheduler == Job Scheduled: C-3PO'
  - '== APP - job-service == Received job request...'
  - '== APP - job-service == Executing maintenance job: Limb Calibration'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 60
timeout_seconds: 120
-->

```bash
dapr run -f .
```

The terminal console output should look similar to this, where:

- The `R2-D2` job is being scheduled.
- The `R2-D2` job is being executed after 2 seconds.
- The `C-3PO` job is being scheduled.
- The `C-3PO` job is being retrieved.

```text
== APP - job-scheduler == Job Scheduled: R2-D2
== APP - job-service == Received job request...
== APP - job-service == Starting droid: R2-D2
== APP - job-service == Executing maintenance job: Oil Change
== APP - job-scheduler == Job Scheduled: C-3PO
== APP - job-scheduler == Job details: {"name":"C-3PO", "dueTime":"30s", "data":{"@type":"ttype.googleapis.com/google.protobuf.StringValue", "expression":"C-3PO:Limb Calibration"}}
```

After 30 seconds, the terminal output should present the `C-3PO` job being processed:

```text
== APP - job-service == Received job request...
== APP - job-service == Starting droid: C-3PO
== APP - job-service == Executing maintenance job: Limb Calibration
```

<!-- END_STEP -->

2. Stop and clean up application processes

<!-- STEP
name: Stop multi-app run 
sleep: 5
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->

## Run apps individually

### Start the job service

1. Open a terminal and run the `job-service` app:

```bash
cd job-service
dapr run --app-id job-service --app-port 6200 --dapr-http-port 6280 -- python app.py
```

### Schedule jobs

1. On a new terminal window, schedule the `R2-D2` Job using the Jobs API:

```bash
curl -X POST \
  http://localhost:6280/v1.0-alpha1/jobs/R2D2 \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "@type": "type.googleapis.com/google.protobuf.StringValue",
          "value": "R2-D2:Oil Change"
        },
        "dueTime": "2s"
    }'
```

Back at the `job-service` app terminal window, the output should be:

```text
== APP - job-service == Received job request...
== APP - job-service == Starting droid: R2-D2
== APP - job-service == Executing maintenance job: Oil Change
```

2. On the same terminal window, schedule the `C-3PO` Job using the Jobs API:

```bash
curl -X POST \
  http://localhost:6280/v1.0-alpha1/jobs/c-3po \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "@type": "type.googleapis.com/google.protobuf.StringValue",
      "value": "C-3PO:Limb Calibration"
    },
    "dueTime": "30s"
  }'
```

### Get a scheduled job

1. On the same terminal window, run the command below to get the recently scheduled `C-3PO` job:

```bash
curl -X GET http://localhost:6280/v1.0-alpha1/jobs/c-3po -H "Content-Type: application/json"
```

You should see the following:

```text
{"name":"C-3PO", "dueTime":"30s", "data":{"@type":"type.googleapis.com/google.protobuf.StringValue", "expression":"C-3PO:Limb Calibration"}}
```

### Delete a scheduled job

1. On the same terminal window, run the command below to delete the recently scheduled `C-3PO` job:

```bash
curl -X DELETE http://localhost:6280/v1.0-alpha1/jobs/c-3po -H "Content-Type: application/json"
```

2. Run the command below to attempt to retrieve the deleted job:

```bash
curl -X GET http://localhost:6280/v1.0-alpha1/jobs/c-3po -H "Content-Type: application/json"
```

You should see an error message indicating that the job was not found:

```text
{"errorCode":"ERR_JOBS_NOT_FOUND","message":"job not found: app||default||job-service||c-3po"}
```