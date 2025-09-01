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

## Environment Variables

- `JOB_SERVICE_DAPR_HTTP_PORT`: The Dapr HTTP port of the job-service (default: 6280)
- `DAPR_HOST`: The Dapr host address (default: http://localhost)

## Run all apps with multi-app run template file

This section shows how to run both applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`. This enables you to test the interactions between multiple applications and will `schedule`, `run`, `get`, and `delete` jobs within a single process.

1. Build the apps:

<!-- STEP
name: Install python dependencies
-->

```bash
pip3 install -r requirements.txt
```

<!-- END_STEP -->

2. Run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - '== APP - job-scheduler == Sending request to schedule job: R2-D2'
  - '== APP - job-scheduler == Job scheduled: R2-D2'
  - '== APP - job-scheduler == Sending request to retrieve job: R2-D2'
  - '== APP - job-scheduler == Job details for R2-D2: {"name":"R2-D2", "dueTime":"15s", "data":{"@type":"type.googleapis.com/google.protobuf.Value", "value":{"@type":"type.googleapis.com/google.protobuf.StringValue", "value":"R2-D2:Oil Change"}}, "failurePolicy":{"constant":{"interval":"1s", "maxRetries":3}}}'
  - '== APP - job-scheduler == Sending request to schedule job: C-3PO'
  - '== APP - job-scheduler == Job scheduled: C-3PO'
  - '== APP - job-service == Received job request...'
  - '== APP - job-service == Starting droid: R2-D2'
  - '== APP - job-service == Executing maintenance job: Oil Change'
  - '== APP - job-scheduler == Sending request to retrieve job: C-3PO'
  - '== APP - job-scheduler == Job details for C-3PO: {"name":"C-3PO", "dueTime":"20s", "data":{"@type":"type.googleapis.com/google.protobuf.Value", "value":{"@type":"type.googleapis.com/google.protobuf.StringValue", "value":"C-3PO:Limb Calibration"}}, "failurePolicy":{"constant":{"interval":"1s", "maxRetries":3}}}'
  - '== APP - job-service == Received job request...'
  - '== APP - job-service == Starting droid: C-3PO'
  - '== APP - job-service == Executing maintenance job: Limb Calibration'
expected_stderr_lines: []
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
- The `R2-D2` job is being retrieved.
- The `C-3PO` job is being scheduled.
- The `C-3PO` job is being retrieved.
- The `R2-D2` job is being executed after 15 seconds.
- The `C-3PO` job is being executed after 20 seconds.

```text
== APP - job-scheduler == Sending request to schedule job: R2-D2
== APP - job-scheduler == Job scheduled: R2-D2
== APP - job-scheduler == Sending request to retrieve job: R2-D2
== APP - job-scheduler == Job details for R2-D2: {"name":"R2-D2", "dueTime":"15s", "data":{"@type":"type.googleapis.com/google.protobuf.Value", "value":{"@type":"type.googleapis.com/google.protobuf.StringValue", "value":"R2-D2:Oil Change"}}, "failurePolicy":{"constant":{"interval":"1s", "maxRetries":3}}}
== APP - job-scheduler == Sending request to schedule job: C-3PO
== APP - job-scheduler == Job scheduled: C-3PO
== APP - job-service == Received job request...
== APP - job-service == Starting droid: R2-D2
== APP - job-service == Executing maintenance job: Oil Change
== APP - job-service == 127.0.0.1 - - "POST /job/R2-D2 HTTP/1.1" 200 -
== APP - job-scheduler == Sending request to retrieve job: C-3PO
== APP - job-scheduler == Job details for C-3PO: {"name":"C-3PO", "dueTime":"20s", "data":{"@type":"type.googleapis.com/google.protobuf.Value", "value":{"@type":"type.googleapis.com/google.protobuf.StringValue", "value":"C-3PO:Limb Calibration"}}, "failurePolicy":{"constant":{"interval":"1s", "maxRetries":3}}}
== APP - job-service == Received job request...
== APP - job-service == Starting droid: C-3PO
== APP - job-service == Executing maintenance job: Limb Calibration
== APP - job-service == 127.0.0.1 - - "POST /job/C-3PO HTTP/1.1" 200 -
```

<!-- END_STEP -->

2. Stop and clean up application processes using a new terminal window.

<!-- STEP
name: Stop multi-app run
sleep: 5
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->

## Run apps individually

### Schedule jobs

1. Open a terminal and run the `job-service` app. Build the dependencies if you haven't already.

```bash
pip3 install -r requirements.txt
```

```bash
cd job-service
dapr run --app-id job-service --app-port 6200 --dapr-http-port 6280 --dapr-grpc-port 6281 -- python app.py
```

2. In a new terminal window, schedule the `R2-D2` Job using the Jobs API:

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

In the `job-service` app terminal window, the output should be:

```text
== APP - job-service == Received job request...
== APP - job-service == Starting droid: R2-D2
== APP - job-service == Executing maintenance job: Oil Change
```

3. On the same terminal window, schedule the `C-3PO` Job using the Jobs API:

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
{"name":"c-3po", "dueTime":"30s", "data":{"@type":"type.googleapis.com/google.protobuf.Value", "value":{"@type":"type.googleapis.com/google.protobuf.StringValue", "value":"C-3PO:Limb Calibration"}}, "failurePolicy":{"constant":{"interval":"1s", "maxRetries":3}}}
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
{"errorCode":"DAPR_SCHEDULER_GET_JOB","message":"failed to get job due to: rpc error: code = NotFound desc = job not found: c-3po","details":[{"@type":"type.googleapis.com/google.rpc.ErrorInfo","domain":"dapr.io","metadata":{"appID":"job-service","namespace":"default"},"reason":"DAPR_SCHEDULER_GET_JOB"}]}
```
