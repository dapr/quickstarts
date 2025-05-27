# Dapr Jobs API (SDK)

In this quickstart, you'll schedule, get, and delete a job using Dapr's Job API. This API is responsible for scheduling and running jobs at a specific time or interval.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/jobs/) link for more information about Dapr and the Jobs API.

> **Note:** This example leverages the Dotnet SDK.  If you are looking for the example using only HTTP requests, [click here](../http/).

This quickstart includes two apps:

- Jobs Scheduler, responsible for scheduling, retrieving and deleting jobs.

## Run all apps with multi-app run template file

This section shows how to run both applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications and will `schedule`, `run`, `get`, and `delete` jobs within a single process.

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
cd ./job-schediler
mvn clean install
cd ..
```

```bash
dapr run --app-id job-service-sdk --app-port 6200 --dapr-http-port 6280
```

2. In a new terminal window, run the Job jar.

```bash
java -jar "JobsSchedulerService-0.0.1-SNAPSHOT.jar"
```

In the `job-service` terminal window, the output should be:

```text
== APP - job-app == Received job request...
== APP - job-app == Starting droid: R2-D2
== APP - job-app == Executing maintenance job: Oil Change
```
