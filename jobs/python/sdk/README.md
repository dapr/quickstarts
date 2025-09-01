# Dapr Jobs API (SDK)

In this quickstart, you'll schedule, get, and delete a job using Dapr's Job API. This API is responsible for scheduling and running jobs at a specific time or interval.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/jobs/) link for more information about Dapr and the Jobs API.

> **Note:** This example leverages the Python SDK. If you are looking for the example using only HTTP requests, [click here](../http/).

This quickstart includes two apps:

- `job-scheduler/app.py`, responsible for scheduling, retrieving and deleting jobs.
- `job-service/app.py`, responsible for handling the triggered jobs.

## Prerequisites

- [Python 3.8+](https://www.python.org/downloads/)
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- [Initialized Dapr environment](https://docs.dapr.io/getting-started/install-dapr-selfhost/)

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
  - '== APP - job-scheduler-sdk == Sending request to schedule job: R2-D2'
  - '== APP - job-service-sdk == Scheduling job: R2-D2'
  - '== APP - job-service-sdk == Job scheduled: R2-D2'
  - '== APP - job-scheduler-sdk == Response: {"name":"R2-D2","job":"Oil Change","dueTime":15}'
  - '== APP - job-scheduler-sdk == Sending request to retrieve job: R2-D2'
  - '== APP - job-service-sdk == Retrieving job: R2-D2'
  - '== APP - job-scheduler-sdk == Job details for R2-D2: {"name":"R2-D2","due_time":"15s","data":{"droid":"R2-D2","task":"Oil Change"}}'
  - '== APP - job-scheduler-sdk == Sending request to schedule job: C-3PO'
  - '== APP - job-service-sdk == Scheduling job: C-3PO'
  - '== APP - job-service-sdk == Job scheduled: C-3PO'
  - '== APP - job-service-sdk == Starting droid: R2-D2'
  - '== APP - job-service-sdk == Executing maintenance job: Oil Change'
  - '== APP - job-scheduler-sdk == Response: {"name":"C-3PO","job":"Limb Calibration","dueTime":20}'
  - '== APP - job-scheduler-sdk == Sending request to retrieve job: C-3PO'
  - '== APP - job-service-sdk == Retrieving job: C-3PO'
  - '== APP - job-scheduler-sdk == Job details for C-3PO: {"name":"C-3PO","due_time":"20s","data":{"droid":"C-3PO","task":"Limb Calibration"}}'
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
- The `R2-D2` job is being retrieved.
- The `C-3PO` job is being scheduled.
- The `C-3PO` job is being retrieved.
- The `R2-D2` job is being executed after 15 seconds.
- The `C-3PO` job is being executed after 20 seconds.

```text
== APP - job-scheduler-sdk == Sending request to schedule job: R2-D2
== APP - job-service-sdk == Scheduling job: R2-D2
== APP - job-service-sdk ==   client.schedule_job_alpha1(job=job, overwrite=True)
== APP - job-service-sdk == Job scheduled: R2-D2
== APP - job-service-sdk == INFO:     192.168.1.106:0 - "POST /scheduleJob HTTP/1.1" 200 OK
== APP - job-scheduler-sdk == Response: {"name":"R2-D2","job":"Oil Change","dueTime":15}
== APP - job-scheduler-sdk == Sending request to retrieve job: R2-D2
== APP - job-service-sdk ==   job = client.get_job_alpha1(name)
== APP - job-service-sdk == Retrieving job: R2-D2
== APP - job-service-sdk == INFO:     192.168.1.106:0 - "GET /getJob/R2-D2 HTTP/1.1" 200 OK
== APP - job-scheduler-sdk == Job details for R2-D2: {"name":"R2-D2","due_time":"15s","data":{"droid":"R2-D2","task":"Oil Change"}}
== APP - job-scheduler-sdk == Sending request to schedule job: C-3PO
== APP - job-service-sdk == Scheduling job: C-3PO
== APP - job-service-sdk == Job scheduled: C-3PO
== APP - job-service-sdk == INFO:     192.168.1.106:0 - "POST /scheduleJob HTTP/1.1" 200 OK
== APP - job-service-sdk == Starting droid: R2-D2
== APP - job-service-sdk == Executing maintenance job: Oil Change
== APP - job-service-sdk == INFO:     127.0.0.1:57206 - "POST /job/R2-D2 HTTP/1.1" 200 OK
== APP - job-scheduler-sdk == Response: {"name":"C-3PO","job":"Limb Calibration","dueTime":20}
== APP - job-scheduler-sdk == Sending request to retrieve job: C-3PO
== APP - job-service-sdk == Retrieving job: C-3PO
== APP - job-service-sdk == INFO:     192.168.1.106:0 - "GET /getJob/C-3PO HTTP/1.1" 200 OK
== APP - job-scheduler-sdk == Job details for C-3PO: {"name":"C-3PO","due_time":"20s","data":{"droid":"C-3PO","task":"Limb Calibration"}}
```

<!-- END_STEP -->

2. Stop and clean up application processes using a new terminal window

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

1. Open a terminal and run the `job-service-sdk` app. Build the dependencies if you haven't already.

```bash
pip3 install -r requirements.txt
```

```bash
cd job-service-sdk
dapr run --app-id job-service-sdk --app-port 6200 --dapr-http-port 6280 --dapr-grpc-port 6281 -- python app.py
```

2. In a new terminal window, schedule the `R2-D2` Job using the Jobs API:

```bash
curl -X POST \
  http://localhost:6200/scheduleJob \
  -H "Content-Type: application/json" \
  -d '{
    "name": "R2-D2",
    "job": "Oil Change",
    "dueTime": 2
  }'
```

In the `job-service-sdk` terminal window, the output should be:

```text

== APP == Scheduling job: R2-D2
== APP == Job scheduled: R2-D2
== APP == INFO:     127.0.0.1:59756 - "POST /scheduleJob HTTP/1.1" 200 OK
== APP == Starting droid: R2-D2
== APP == Executing maintenance job: Oil Change
== APP == INFO:     127.0.0.1:59759 - "POST /job/R2-D2 HTTP/1.1" 200 OK
```

3. On the same terminal window, schedule the `C-3PO` Job using the Jobs API:

```bash
curl -X POST \
  http://localhost:6200/scheduleJob \
  -H "Content-Type: application/json" \
  -d '{
    "name": "C-3PO",
    "job": "Limb Calibration",
    "dueTime": 30
  }'
```

### Get a scheduled job

1. On the same terminal window, run the command below to get the recently scheduled `C-3PO` job:

```bash
curl -X GET http://localhost:6200/getJob/C-3PO -H "Content-Type: application/json"
```

You should see the following:

```text
{"name":"C-3PO","due_time":"30s","data":{"droid":"C-3PO","task":"Limb Calibration"}}
```

### Delete a scheduled job

1. On the same terminal window, run the command below to delete the recently scheduled `C-3PO` job:

```bash
curl -X DELETE http://localhost:6200/deleteJob/C-3PO -H "Content-Type: application/json"
```

You should see the following:

```text
{"message":"Job deleted"}
```

2. Run the command below to attempt to retrieve the deleted job:

```bash
curl -X GET http://localhost:6200/getJob/C-3PO -H "Content-Type: application/json"
```

In the `job-service-sdk` terminal window, the output should be similar to the following:

```text
{"detail":"<_InactiveRpcError of RPC that terminated with:\n\tstatus = StatusCode.INTERNAL\n\tdetails = \"failed to get job due to: rpc error: code = NotFound desc = job not found: C-3PO\"\n\tdebug_error_string = \"UNKNOWN:Error received from peer ipv4:127.0.0.1:6281 {grpc_status:13, grpc_message:\"failed to get job due to: rpc error: code = NotFound desc = job not found: C-3PO\"}\"\n>"}
```
