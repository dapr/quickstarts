# Dapr Jobs API (SDK)

In this quickstart, you'll schedule, get, and delete a job using Dapr's Job API. This API is responsible for scheduling and running jobs at a specific time or interval.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/jobs/) link for more information about Dapr and the Jobs API.

> **Note:** This example leverages the Java SDK.

This quickstart includes one app:

- Job Scheduler, responsible for scheduling, retrieving and deleting jobs.

## Run all apps with multi-app run template file

This section shows how to run the applications using a [multi-app run template file](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications and will `schedule`, `run`, `get`, and `delete` jobs within a single process.

1. Build the apps:

<!-- STEP
name: Build dependencies for job-scheduler
sleep: 1
-->

```bash
cd ./job-scheduler
mvn clean install
cd ..
```

<!-- END_STEP -->

<!-- STEP
name: Build dependencies for job-service
sleep: 1
-->

```bash
cd ./job-service
mvn clean install
cd ..
```

<!-- END_STEP -->

2. Run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - '== APP - job-scheduler-sdk == Job Scheduled: {"name":"R2-D2","data":"T2lsIENoYW5nZQ==","schedule":{"expression":"0/5 * * * * *"},"dueTime":null,"repeats":null,"ttl":null}'
  - '== APP - job-service-sdk == Starting Droid: R2-D2'
  - '== APP - job-scheduler-sdk == Scheduling a Job with name C-3PO'
  - '== APP - job-scheduler-sdk == Job Scheduled: {"name":"C-3PO","data":"TGltYiBDYWxpYnJhdGlvbg==","schedule":{"expression":"0/5 * * * * *"},"dueTime":null,"repeats":null,"ttl":null}'
  - '== APP - job-service-sdk == Starting Droid: R2-D2'
  - '== APP - job-service-sdk == Executing Maintenance: Oil Change'
  - '== APP - job-service-sdk == Starting Droid: C-3PO'
  - '== APP - job-service-sdk == Executing Maintenance: Limb Calibration'
  - '== APP - job-scheduler-sdk == Getting Job: C-3PO'
  - '== APP - job-scheduler-sdk == Job Details: {"name":"C-3PO","data":"TGltYiBDYWxpYnJhdGlvbg==","schedule":{"expression":"0/5 * * * * *"},"dueTime":null,"repeats":null,"ttl":null}'
  - '== APP - job-scheduler-sdk == Deleting Job: C-3PO'
  - '== APP - job-scheduler-sdk == Deleted Job: C-3PO'
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
- The `R2-D2` job is completed.
- The `R2-D2` job is being retrieved.
- The `C-3PO` job is being scheduled.
- The `C-3PO` job is completed.
- The `C-3PO` job is being retrieved.
- The `C-3PO` job is being deleted.
- The `C-3PO` job is deleted.

```text
== APP - job-scheduler-sdk == Job Scheduled: {"name":"R2-D2","data":"T2lsIENoYW5nZQ==","schedule":{"expression":"0/5 * * * * *"},"dueTime":null,"repeats":null,"ttl":null}
== APP - job-service-sdk == Starting Droid: R2-D2
== APP - job-scheduler-sdk == Scheduling a Job with name C-3PO
== APP - job-scheduler-sdk == Job Scheduled: {"name":"C-3PO","data":"TGltYiBDYWxpYnJhdGlvbg==","schedule":{"expression":"0/5 * * * * *"},"dueTime":null,"repeats":null,"ttl":null}
== APP - job-service-sdk == Starting Droid: R2-D2
== APP - job-service-sdk == Executing Maintenance: Oil Change
== APP - job-service-sdk == Starting Droid: C-3PO
== APP - job-service-sdk == Executing Maintenance: Limb Calibration
== APP - job-scheduler-sdk == Getting Job: C-3PO
== APP - job-scheduler-sdk == Job Details: {"name":"C-3PO","data":"TGltYiBDYWxpYnJhdGlvbg==","schedule":{"expression":"0/5 * * * * *"},"dueTime":null,"repeats":null,"ttl":null}
== APP - job-scheduler-sdk == Deleting Job: C-3PO
== APP - job-scheduler-sdk == Deleted Job: C-3PO
== APP - job-service-sdk == Starting Droid: R2-D2

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
mvn clean install
```

```bash
dapr run --app-id job-scheduler-sdk --app-port 8080 --dapr-grpc-port 6200 --dapr-http-port 6390 --log-level debug -- java -jar  target/JobService-0.0.1-SNAPSHOT.jar com.service.JobServiceStartup
```

2. Open another terminal and run the `job-scheduler` app. Build the dependencies if you haven't already.

```bash
cd ./job-scheduler
mvn clean install
```

```bash
java -jar "target/JobsScheduler-0.0.1-SNAPSHOT.jar"
```

3. Here is how the outputs will look like


In the `job-scheduler` terminal window, the output should be:

```text
== APP - job-scheduler-sdk == Job Scheduled: {"name":"R2-D2","data":"T2lsIENoYW5nZQ==","schedule":{"expression":"0/5 * * * * *"},"dueTime":null,"repeats":null,"ttl":null}
== APP - job-scheduler-sdk == Scheduling a Job with name C-3PO
== APP - job-scheduler-sdk == Job Scheduled: {"name":"C-3PO","data":"TGltYiBDYWxpYnJhdGlvbg==","schedule":{"expression":"0/5 * * * * *"},"dueTime":null,"repeats":null,"ttl":null}
== APP - job-scheduler-sdk == Getting Job: C-3PO
== APP - job-scheduler-sdk == Job Details: {"name":"C-3PO","data":"TGltYiBDYWxpYnJhdGlvbg==","schedule":{"expression":"0/5 * * * * *"},"dueTime":null,"repeats":null,"ttl":null}
== APP - job-scheduler-sdk == Deleting Job: C-3PO
== APP - job-scheduler-sdk == Deleted Job: C-3PO
```

In the `job-service` terminal window, the output should be:

```text
== APP - job-service-sdk == Starting Droid: R2-D2
== APP - job-service-sdk == Starting Droid: R2-D2
== APP - job-service-sdk == Executing Maintenance: Oil Change
== APP - job-service-sdk == Starting Droid: C-3PO
== APP - job-service-sdk == Executing Maintenance: Limb Calibration
== APP - job-service-sdk == Starting Droid: R2-D2
```