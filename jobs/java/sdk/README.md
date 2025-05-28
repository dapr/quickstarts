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
  - '== APP - job-scheduler-sdk == **** Scheduling a Job with name R2-D2 *****'
  - '== APP - job-scheduler-sdk == **** Scheduling job R2-D2 completed *****'
  - '== APP - job-scheduler-sdk == **** Retrieving a Job with name R2-D2 *****'
  - '== APP - job-scheduler-sdk == Job Name: R2-D2'
  - '== APP - job-scheduler-sdk == **** Scheduling a Job with name C-3PO *****'
  - '== APP - job-scheduler-sdk == **** Scheduling job C-3PO completed *****'
  - '== APP - job-scheduler-sdk == **** Retrieving a Job with name C-3PO *****'
  - '== APP - job-scheduler-sdk == Job Name: C-3PO'
  - '== APP - job-scheduler-sdk == **** Deleting a Job with name C-3PO *****'
  - '== APP - job-scheduler-sdk == **** Deleted a Job with name C-3PO *****'
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
== APP - job-scheduler-sdk == **** Scheduling a Job with name R2-D2 *****
== APP - job-scheduler-sdk == **** Scheduling job R2-D2 completed *****
== APP - job-scheduler-sdk == **** Retrieving a Job with name R2-D2 *****
== APP - job-scheduler-sdk == Job Name: R2-D2
== APP - job-scheduler-sdk == **** Scheduling a Job with name C-3PO *****
== APP - job-scheduler-sdk == **** Scheduling job C-3PO completed *****
== APP - job-scheduler-sdk == **** Retrieving a Job with name C-3PO *****
== APP - job-scheduler-sdk == Job Name: C-3PO
== APP - job-scheduler-sdk == **** Deleting a Job with name C-3PO *****
== APP - job-scheduler-sdk == **** Deleted a Job with name C-3PO *****
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

1. Open a terminal and run the `job-scheduler` app. Build the dependencies if you haven't already.

```bash
cd ./job-schediler
mvn clean install
```

```bash
dapr run --app-id job-service-sdk --app-port 8080 --dapr-grpc-port 6200 --dapr-http-port 6280
```

2. In a new terminal window, run the Job jar.

```bash
java -jar "target/JobsSchedulerService-0.0.1-SNAPSHOT.jar"
```

In the `job-scheduler` terminal window, the output should be:

```text
== APP - job-scheduler-sdk == **** Scheduling a Job with name R2-D2 *****
== APP - job-scheduler-sdk == **** Scheduling job R2-D2 completed *****
== APP - job-scheduler-sdk == **** Retrieving a Job with name R2-D2 *****
== APP - job-scheduler-sdk == Job Name: R2-D2
== APP - job-scheduler-sdk == **** Scheduling a Job with name C-3PO *****
== APP - job-scheduler-sdk == **** Scheduling job C-3PO completed *****
== APP - job-scheduler-sdk == **** Retrieving a Job with name C-3PO *****
== APP - job-scheduler-sdk == Job Name: C-3PO
== APP - job-scheduler-sdk == **** Deleting a Job with name C-3PO *****
== APP - job-scheduler-sdk == **** Deleted a Job with name C-3PO *****
```
