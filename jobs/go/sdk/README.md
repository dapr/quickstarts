# Dapr Jobs

In this quickstart, you'll schedule, get, and delete a job using Dapr's Job API. This API is responsible for scheduling and running jobs at a specific time or interval.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/jobs/) link for more information about Dapr and the Job API.

> **Note:** This example leverages the SDK only.  If you are looking for the example using the HTTP requests [click here](../http/).

This quickstart includes two apps:

- `job-scheduler.go`, responsible for scheduling, retrieving and deleting jobs.
- `job-service.go`, responsible for handling the scheduled jobs.

## Run the app with the template file

This section shows how to run both applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications and will `schedule`, `run`, `get`, and `delete` jobs within a single process.

Open a new terminal window and run the multi app run template:

<!-- STEP
 name: Run multi app run template
 expected_stdout_lines:
   - 'Starting droid: R2-D2'
   - 'Executing maintenance job: Oil Change'
   - 'Starting droid: C-3PO'
   - 'Executing maintenance job: Memory Wipe'
 expected_stderr_lines:
 output_match_mode: substring
 match_order: none
 background: false
 sleep: 100
 timeout_seconds: 180
 -->

```bash
dapr run -f .
```

The terminal console output should look similar to this, where:

- The `R2-D2` job is being scheduled.
- The `C-3PO` job is being scheduled.
- The `C-3PO` job is being retrieved.
- The `BB-8` job is being scheduled.
- The `BB-8` job is being retrieved.
- The `BB-8` job is being deleted.
- The `R2-D2` job is being executed after 5 seconds.
- The `R2-D2` job is being executed after 10 seconds.


```text
dapr client initializing for: 127.0.0.1:6481
Registered job handler for:  R2-D2
Registered job handler for:  C-3PO
Registered job handler for:  BB-8
Starting server on port: 6400
Job scheduled:  R2-D2
Job scheduled:  C-3PO
2024/07/17 18:09:59 job:{name:"C-3PO"  due_time:"10s"  data:{value:"{\"droid\":\"C-3PO\",\"Task\":\"Memory Wipe\"}"}}
Get job response:  {"droid":"C-3PO","Task":"Memory Wipe"}
Job scheduled:  BB-8
2024/07/17 18:09:59 job:{name:"BB-8"  due_time:"15s"  data:{value:"{\"droid\":\"BB-8\",\"Task\":\"Internal Gyroscope Check\"}"}}
Get job response:  {"droid":"BB-8","Task":"Internal Gyroscope Check"}
Deleted job:  BB-8
```

After 5 seconds, the terminal output should present the `R2-D2` job being processed:

```text
Starting droid: R2-D2
Executing maintenance job: Oil Change
```

After 10 seconds, the terminal output should present the `C3-PO` job being processed:

```text
Starting droid: C-3PO
Executing maintenance job: Memory Wipe
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

## Run the Jobs APIs individually

### Schedule Jobs

1. Open a terminal and run the `job-service` app:

```bash
dapr run --app-id job-service-sdk --app-port 6400 --dapr-grpc-port 6481 --app-protocol grpc -- go run .
```

The output should be:

```text
dapr client initializing for: 127.0.0.1:6481
Registered job handler for:  R2-D2
Registered job handler for:  C-3PO
Registered job handler for:  BB-8
Starting server on port: 6400
```

2. On a new terminal window, run the `job-scheduler` app:

```bash
dapr run --app-id job-scheduler-sdk --app-port 6500 -- go run .
```

The output should be:

```text
dapr client initializing for: 
Get job response:  {"droid":"C-3PO","Task":"Memory Wipe"}
Get job response:  {"droid":"BB-8","Task":"Internal Gyroscope Check"}
Job deleted:  BB-8
```

Back at the `job-service` app terminal window, the output should be:

```text
Job scheduled:  R2-D2
Job scheduled:  C-3PO
2024/07/17 18:25:36 job:{name:"C-3PO"  due_time:"10s"  data:{value:"{\"droid\":\"C-3PO\",\"Task\":\"Memory Wipe\"}"}}
Job scheduled:  BB-8
2024/07/17 18:25:36 job:{name:"BB-8"  due_time:"15s"  data:{value:"{\"droid\":\"BB-8\",\"Task\":\"Internal Gyroscope Check\"}"}}
Starting droid: R2-D2
Executing maintenance job: Oil Change
Starting droid: C-3PO
Executing maintenance job: Memory Wipe
```
