# Dapr jobs

In this quickstart, you'll create two microservices that demonstrate how the Jobs API can be readily utilized in 
a .NET application. The Jobs App will schedule the job and will handle its invocation when triggered, sending a 
message to another microservice to simulate some sort of operation.

Visit [this link](https://docs.dapr.io/developing-applications/building-blocks/jobs/jobs-overview/) for more
information about the Dapr Jobs API.

This quickstart includes the following two services:
- Schedules Jobs and handles job invocations: `JobsApp`
- Receives service invocation and simulates ETL operation: `EtlService`

## Run the quickstart
1. Open a new terminal window and launch the ETL service with the following command:

<!-- STEP
name: Run ETL service
expected_stdout_lines:
  - 'Starting Dapr with id etl-svc.'
  - 'Updating metadata for app command: dotnet run --project ./EtlService/EtlService.csproj --urls=http://localhost:5001'
  - 'You're up and running! Both Dapr and your app logs will appear here.'
output_match_mode: substring
match_order: none
background: true
sleep: 15
timeout_seconds: 45
-->

```bash
dapr run --app-id etl-svc -- dotnet run --project ./EtlService/EtlService.csproj --urls=http://localhost:5001
```
The terminal console should show standard startup logs like the following since the app will start, but then wait until 
the service is invoked:

```text
Starting Dapr with id etl-svc. HTTP Port: 50737. gRPC Port: 50738
Checking if Dapr sidecar is listening on HTTP port 50737
Flag --components-path has been deprecated, use --resources-path
Flag --dapr-http-max-request-size has been deprecated, use '--max-body-size 4Mi'
Flag --dapr-http-read-buffer-size has been deprecated, use '--read-buffer-size 4Ki'
time="2025-01-15T09:44:15.8139364-06:00" level=info msg="Starting Dapr Runtime -- version 1.15.0-rc.1 -- commit fdd642e96ac06163b30ef1db751a403351887dc9" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8139364-06:00" level=info msg="Log level set to: info" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8139364-06:00" level=warning msg="mTLS is disabled. Skipping certificate request and tls validation" app_id=etl-svc instance=Incubus scope=dapr.runtime.security type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8155037-06:00" level=info msg="metric spec: {\"enabled\":true}" app_id=etl-svc instance=Incubus scope=dapr.runtime.diagnostics type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8155037-06:00" level=info msg="Using default latency distribution buckets: [1 2 3 4 5 6 8 10 13 16 20 25 30 40 50 65 80 100 130 160 200 250 300 400 500 650 800 1000 2000 5000 10000 20000 50000 100000]" app_id=etl-svc instance=Incubus scope=dapr.runtime.diagnostics type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8155037-06:00" level=warning msg="The default value for 'spec.metric.http.increasedCardinality' will change to 'false' in Dapr 1.15 or later" app_id=etl-svc instance=Incubus scope=dapr.runtime.diagnostics type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8164977-06:00" level=info msg="standalone mode configured" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8164977-06:00" level=info msg="app id: etl-svc" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8171436-06:00" level=info msg="Scheduler client initialized for address: localhost:6060" app_id=etl-svc instance=Incubus scope=dapr.runtime.scheduler.clients type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8171436-06:00" level=info msg="Scheduler clients initialized" app_id=etl-svc instance=Incubus scope=dapr.runtime.scheduler.clients type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8171436-06:00" level=info msg="Dapr trace sampler initialized: ParentBased{root:AlwaysOnSampler,remoteParentSampled:AlwaysOnSampler,remoteParentNotSampled:AlwaysOffSampler,localParentSampled:AlwaysOnSampler,localParentNotSampled:AlwaysOffSampler}" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8171436-06:00" level=info msg="metrics server started on :50739/" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8483454-06:00" level=info msg="local service entry announced: etl-svc -> 192.168.2.38:50740" app_id=etl-svc component="nr (mdns/v1)" instance=Incubus scope=dapr.contrib type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8539638-06:00" level=info msg="Initialized name resolution to mdns" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8545343-06:00" level=info msg="Loading components…" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8556398-06:00" level=info msg="Waiting for all outstanding components to be processed…" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8556398-06:00" level=info msg="All outstanding components processed" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8561666-06:00" level=info msg="Loading endpoints…" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.856722-06:00" level=info msg="Waiting for all outstanding http endpoints to be processed…" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.856722-06:00" level=info msg="All outstanding http endpoints processed" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.856722-06:00" level=info msg="Loading Declarative Subscriptions…" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8572499-06:00" level=warning msg="App channel is not initialized. Did you configure an app-port?" app_id=etl-svc instance=Incubus scope=dapr.runtime.channels type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8577923-06:00" level=info msg="gRPC server listening on TCP address: :50738" app_id=etl-svc instance=Incubus scope=dapr.runtime.grpc.api type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8577923-06:00" level=info msg="Enabled gRPC tracing middleware" app_id=etl-svc instance=Incubus scope=dapr.runtime.grpc.api type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8577923-06:00" level=info msg="Enabled gRPC metrics middleware" app_id=etl-svc instance=Incubus scope=dapr.runtime.grpc.api type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8583182-06:00" level=info msg="Registering workflow engine for gRPC endpoint: [::]:50738" app_id=etl-svc instance=Incubus scope=dapr.runtime.grpc.api type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8583182-06:00" level=info msg="API gRPC server is running on port 50738" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8583182-06:00" level=warning msg="The default value for 'spec.metric.http.increasedCardinality' will change to 'false' in Dapr 1.15 or later" app_id=etl-svc instance=Incubus scope=dapr.runtime.http type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8583182-06:00" level=info msg="Enabled max body size HTTP middleware with size 4194304 bytes" app_id=etl-svc instance=Incubus scope=dapr.runtime.http type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8588281-06:00" level=info msg="Enabled tracing HTTP middleware" app_id=etl-svc instance=Incubus scope=dapr.runtime.http type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8588281-06:00" level=info msg="Enabled metrics HTTP middleware" app_id=etl-svc instance=Incubus scope=dapr.runtime.http type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8595557-06:00" level=info msg="HTTP server listening on TCP address: :50737" app_id=etl-svc instance=Incubus scope=dapr.runtime.http type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8595557-06:00" level=info msg="HTTP server is running on port 50737" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8595557-06:00" level=info msg="The request body size parameter is: 4194304 bytes" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.860102-06:00" level=info msg="gRPC server listening on TCP address: :50740" app_id=etl-svc instance=Incubus scope=dapr.runtime.grpc.internal type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.860102-06:00" level=info msg="Enabled gRPC tracing middleware" app_id=etl-svc instance=Incubus scope=dapr.runtime.grpc.internal type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.860102-06:00" level=info msg="Enabled gRPC metrics middleware" app_id=etl-svc instance=Incubus scope=dapr.runtime.grpc.internal type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.860102-06:00" level=info msg="Internal gRPC server is running on :50740" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8606266-06:00" level=info msg="actors: state store is not configured - this is okay for clients but services with hosted actors will fail to initialize!" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8611851-06:00" level=info msg="Configuring actors placement provider 'placement'. Configuration: 'placement:localhost:6050'" app_id=etl-svc instance=Incubus scope=dapr.runtime.actor type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8611851-06:00" level=info msg="Configuring actor reminders provider 'default'. Configuration: ''" app_id=etl-svc instance=Incubus scope=dapr.runtime.actor type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8611851-06:00" level=info msg="Actor runtime started. Idle timeout: 1h0m0s" app_id=etl-svc instance=Incubus scope=dapr.runtime.actor type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8616921-06:00" level=info msg="Configuring workflow engine with actors backend" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8617175-06:00" level=info msg="Registering component for dapr workflow engine..." app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8617175-06:00" level=info msg="Initializing Dapr workflow component" app_id=etl-svc component="dapr (workflow.dapr/v1)" instance=Incubus scope=dapr.contrib type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8617175-06:00" level=info msg="Workflow engine initialized." app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.862781-06:00" level=info msg="dapr initialized. Status: Running. Init Elapsed 46ms" app_id=etl-svc instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8627966-06:00" level=info msg="Scheduler stream connected" app_id=etl-svc instance=Incubus scope=dapr.runtime.scheduler type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8924449-06:00" level=info msg="Actor API level in the cluster has been updated to 10" app_id=etl-svc instance=Incubus scope=dapr.runtime.actor type=log ver=1.15.0-rc.1
time="2025-01-15T09:44:15.8924449-06:00" level=info msg="Placement tables updated, version: 9" app_id=etl-svc instance=Incubus scope=dapr.runtime.actors.placement type=log ver=1.15.0-rc.1
Checking if Dapr sidecar is listening on GRPC port 50738
Dapr sidecar is up and running.
Updating metadata for appPID: 41396
Updating metadata for app command: dotnet run --project ./EtlService/EtlService.csproj --urls=http://localhost:5001
You're up and running! Both Dapr and your app logs will appear here.
```

2. Open a second terminal window and launch the Jobs app with the following command:

<!-- STEP
name: Run Jobs App service
expected-stdout_lines:
  - 'Starting Dapr with id job-app.'
  - 'Updating metadata for app command: dotnet run --project ./JobsApp/JobsApp.csproj --urls=http://localhost:5002'
  - 'You're up and running! Both Dapr and your app logs will appear here.'
output_match_mode: substring
match_order: none
background: true
sleep: 15
timeout_seconds: 45
-->

```bash
dapr run --app-id jobs-app -- dotnet run --project ./JobsApp/JobsApp.csproj --urls=http://localhost:5002
```

As with the other application, the terminal console should show standard startup logs, but will then proceed to show your
application logs as the job is scheduled:

```text
You're up and running! Both Dapr and your app logs will appear here.


```

3. When you're finished, hit Ctrl + C in both terminals to stop and clean up the application processes