# Dapr Jobs API (SDK)

In this quickstart, you'll schedule, get, and delete a job using Dapr's Job API. This API is responsible for scheduling and running jobs at a specific time or interval.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/jobs/) link for more information about Dapr and the Jobs API.

> **Note:** This example leverages the Dotnet SDK.  If you are looking for the example using only HTTP requests, [click here](../http/).

This quickstart includes two apps:

- Jobs Scheduler, responsible for scheduling, retrieving and deleting jobs.
- Jobs Service, responsible for handling the triggered jobs.

## Run all apps with multi-app run template file

This section shows how to run both applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications and will `schedule`, `run`, `get`, and `delete` jobs within a single process.

1. Build the apps:

<!-- STEP
name: Build dependencies for job-service
sleep: 1
-->

```bash
cd ./job-service
dotnet build
```

<!-- END_STEP -->

<!-- STEP
name: Build dependencies for job-scheduler
sleep: 1
-->

```bash
cd ./job-scheduler
dotnet build
```

<!-- END_STEP -->

2. Run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - '== APP - job-service-sdk == Job Scheduled: R2-D2'
  - '== APP - job-service-sdk == Job Scheduled: C-3PO'
  - '== APP - job-service-sdk == Starting droid: R2-D2'
  - '== APP - job-service-sdk == Executing maintenance job: Oil Change'
  - '== APP - job-service-sdk == Starting droid: C-3PO'
  - '== APP - job-service-sdk == Executing maintenance job: Limb Calibration'
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
== APP - job-scheduler-sdk == Scheduling job...
== APP - job-service-sdk == Job Scheduled: R2-D2
== APP - job-scheduler-sdk == Job scheduled: {"name":"R2-D2","job":"Oil Change","dueTime":15}
== APP - job-scheduler-sdk == Getting job: R2-D2
== APP - job-service-sdk == Getting job...
== APP - job-scheduler-sdk == Job details: {"schedule":"@every 15s","repeatCount":1,"dueTime":null,"ttl":null,"payload":"ChtkYXByLmlvL3NjaGVkdWxlL2pvYnBheWxvYWQSJXsiZHJvaWQiOiJSMi1EMiIsInRhc2siOiJPaWwgQ2hhbmdlIn0="}
== APP - job-scheduler-sdk == Scheduling job...
== APP - job-service-sdk == Job Scheduled: C-3PO
== APP - job-scheduler-sdk == Job scheduled: {"name":"C-3PO","job":"Limb Calibration","dueTime":20}
== APP - job-scheduler-sdk == Getting job: C-3PO
== APP - job-service-sdk == Getting job...
== APP - job-scheduler-sdk == Job details: {"schedule":"@every 20s","repeatCount":1,"dueTime":null,"ttl":null,"payload":"ChtkYXByLmlvL3NjaGVkdWxlL2pvYnBheWxvYWQSK3siZHJvaWQiOiJDLTNQTyIsInRhc2siOiJMaW1iIENhbGlicmF0aW9uIn0="}
== APP - job-service-sdk == Handling job...
== APP - job-service-sdk == Starting droid: R2-D2
== APP - job-service-sdk == Executing maintenance job: Oil Change
```

After 20 seconds, the terminal output should present the `C-3PO` job being processed:

```text
== APP - job-service-sdk == Handling job...
== APP - job-service-sdk == Starting droid: C-3PO
== APP - job-service-sdk == Executing maintenance job: Limb Calibration
```

<!-- END_STEP -->

3. Stop and clean up application processes.

<!-- STEP
name: Stop multi-app run
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->

## Run apps individually

### Schedule Jobs

1. Open a terminal and run the `job-service` app. Build the dependencies if you haven't already.

```bash
cd ./job-service
dotnet build
```

```bash
dapr run --app-id job-service-sdk --app-port 6200 --dapr-http-port 6280 -- dotnet run
```

2. In a new terminal window, schedule the `R2-D2` Job using the Jobs API.

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

In the `job-service` terminal window, the output should be:

```text
== APP - job-app == Received job request...
== APP - job-app == Starting droid: R2-D2
== APP - job-app == Executing maintenance job: Oil Change
```

3. On the same terminal window, schedule the `C-3PO` Job using the Jobs API.

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

1. On the same terminal window, run the command below to get the recently scheduled `C-3PO` job.

```bash
curl -X GET http://localhost:6200/getJob/C-3PO -H "Content-Type: application/json" 
```

You should see the following:

```text
{"name":"c-3po", "dueTime":"30s", "data":{"@type":"type.googleapis.com/google.protobuf.Value", "value":{"Value":"C-3PO:Limb Calibration"}}}
```

### Delete a scheduled job

1. On the same terminal window, run the command below to deleted the recently scheduled `C-3PO` job.

```bash
curl -X DELETE http://localhost:6200/deleteJob/C-3PO -H "Content-Type: application/json" 
```

2. Run the command below to attempt to retrieve the deleted job:

```bash
curl -X GET http://localhost:6200/getJob/C-3PO -H "Content-Type: application/json"
```

In the `job-service` terminal window, the output should be similar to the following:

```text
ERRO[0157] Error getting job C-3PO due to: rpc error: code = NotFound desc = job not found: C-3PO  instance=local scope=dapr.api type=log ver=1.15.0
```
