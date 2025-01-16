# Dapr Conversation API

In this quickstart, you'll create a microservice that demonstrates how the Conversation API can be readily utilized in 
a .NET application. The microservice will send a prompt to the configured Conversation component and write
out the response to the console.

Visit [this link](https://docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/) for 
more information about the Dapr Conversation API.

## Configure your environment variables
This quickstart utilizes Anthropic's LLM which means you will need an API key in order to communicate with their service.
It needs to be saved to your computer as an environment variable called "anthropic" so Dapr can read it when it launches.

## Run the quickstart
1. Open a new terminal window and launch the conversation service with the following command:

<!-- STEP
name: Run conversation service
expected_stdout_lines:
  - 'Starting Dapr with id conversation. HTTP Port:'
  - 'Updating metadata for app command: dotnet run'
  - 'You're up and running! Both Dapr and your app logs will appear here.' 
  - '== APP ==       Sent prompt to conversation API: 'Please write a witty sonnet about the Dapr distributed programming framework at dapr.io''
  - '== APP ==       Received message from the conversation API:'
  - 'Exited App successfully'
output_match_mode: substring
match_order: none
background: true
sleep: 15
timeout_seconds: 45
-->

```bash
dapr run --app-id conversation --resources-path "../../../components/" -- dotnet run
```

The terminal console should show standard startup logs followed by your application output similar to the following:

```text
Starting Dapr with id conversation. HTTP Port: 50114. gRPC Port: 50115
Checking if Dapr sidecar is listening on HTTP port 50114
Flag --dapr-http-max-request-size has been deprecated, use '--max-body-size 4Mi'
Flag --dapr-http-read-buffer-size has been deprecated, use '--read-buffer-size 4Ki'
time="2025-01-15T22:36:02.9765783-06:00" level=info msg="Starting Dapr Runtime -- version 1.15.0-rc.1 -- commit fdd642e96ac06163b30ef1db751a403351887dc9" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:02.9766089-06:00" level=info msg="Log level set to: info" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:02.9766089-06:00" level=warning msg="mTLS is disabled. Skipping certificate request and tls validation" app_id=conversation instance=Incubus scope=dapr.runtime.security type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:02.978407-06:00" level=info msg="metric spec: {\"enabled\":true}" app_id=conversation instance=Incubus scope=dapr.runtime.diagnostics type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:02.9789532-06:00" level=info msg="Using default latency distribution buckets: [1 2 3 4 5 6 8 10 13 16 20 25 30 40 50 65 80 100 130 160 200 250 300 400 500 650 800 1000 2000 5000 10000 20000 50000 100000]" app_id=conversation instance=Incubus scope=dapr.runtime.diagnostics type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:02.9789532-06:00" level=warning msg="The default value for 'spec.metric.http.increasedCardinality' will change to 'false' in Dapr 1.15 or later" app_id=conversation instance=Incubus scope=dapr.runtime.diagnostics type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:02.9800144-06:00" level=info msg="standalone mode configured" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:02.9800144-06:00" level=info msg="app id: conversation" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:02.9805429-06:00" level=info msg="Scheduler client initialized for address: localhost:6060" app_id=conversation instance=Incubus scope=dapr.runtime.scheduler.clients type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:02.9805429-06:00" level=info msg="Scheduler clients initialized" app_id=conversation instance=Incubus scope=dapr.runtime.scheduler.clients type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:02.9805429-06:00" level=info msg="Dapr trace sampler initialized: ParentBased{root:AlwaysOnSampler,remoteParentSampled:AlwaysOnSampler,remoteParentNotSampled:AlwaysOffSampler,localParentSampled:AlwaysOnSampler,localParentNotSampled:AlwaysOffSampler}" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:02.9805429-06:00" level=info msg="metrics server started on :50116/" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0167375-06:00" level=info msg="local service entry announced: conversation -> 192.168.2.38:50117" app_id=conversation component="nr (mdns/v1)" instance=Incubus scope=dapr.contrib type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0167375-06:00" level=info msg="Initialized name resolution to mdns" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0172676-06:00" level=info msg="Loading components…" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0189224-06:00" level=info msg="Component loaded: envvar-secrets (secretstores.local.env/v1)" app_id=conversation instance=Incubus scope=dapr.runtime.processor type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0191094-06:00" level=info msg="Waiting for all outstanding components to be processed…" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0191094-06:00" level=info msg="Component loaded: conversation (conversation.anthropic/v1)" app_id=conversation instance=Incubus scope=dapr.runtime.processor type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.019644-06:00" level=info msg="All outstanding components processed" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.019644-06:00" level=info msg="Loading endpoints…" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0208068-06:00" level=info msg="Waiting for all outstanding http endpoints to be processed…" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0213546-06:00" level=info msg="All outstanding http endpoints processed" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0213546-06:00" level=info msg="Loading Declarative Subscriptions…" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0226565-06:00" level=warning msg="App channel is not initialized. Did you configure an app-port?" app_id=conversation instance=Incubus scope=dapr.runtime.channels type=log ver=1.15.0-rc.1       
time="2025-01-15T22:36:03.0226565-06:00" level=info msg="gRPC server listening on TCP address: :50115" app_id=conversation instance=Incubus scope=dapr.runtime.grpc.api type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0226565-06:00" level=info msg="Enabled gRPC tracing middleware" app_id=conversation instance=Incubus scope=dapr.runtime.grpc.api type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0235109-06:00" level=info msg="Enabled gRPC metrics middleware" app_id=conversation instance=Incubus scope=dapr.runtime.grpc.api type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0235109-06:00" level=info msg="Registering workflow engine for gRPC endpoint: [::]:50115" app_id=conversation instance=Incubus scope=dapr.runtime.grpc.api type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0235109-06:00" level=info msg="API gRPC server is running on port 50115" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0235109-06:00" level=warning msg="The default value for 'spec.metric.http.increasedCardinality' will change to 'false' in Dapr 1.15 or later" app_id=conversation instance=Incubus scope=dapr.runtime.http type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0240603-06:00" level=info msg="Enabled max body size HTTP middleware with size 4194304 bytes" app_id=conversation instance=Incubus scope=dapr.runtime.http type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0240603-06:00" level=info msg="Enabled tracing HTTP middleware" app_id=conversation instance=Incubus scope=dapr.runtime.http type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0240603-06:00" level=info msg="Enabled metrics HTTP middleware" app_id=conversation instance=Incubus scope=dapr.runtime.http type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0245915-06:00" level=info msg="HTTP server listening on TCP address: :50114" app_id=conversation instance=Incubus scope=dapr.runtime.http type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0251323-06:00" level=info msg="HTTP server is running on port 50114" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0251323-06:00" level=info msg="The request body size parameter is: 4194304 bytes" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0251323-06:00" level=info msg="gRPC server listening on TCP address: :50117" app_id=conversation instance=Incubus scope=dapr.runtime.grpc.internal type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0251323-06:00" level=info msg="Enabled gRPC tracing middleware" app_id=conversation instance=Incubus scope=dapr.runtime.grpc.internal type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0256733-06:00" level=info msg="Enabled gRPC metrics middleware" app_id=conversation instance=Incubus scope=dapr.runtime.grpc.internal type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0256733-06:00" level=info msg="Internal gRPC server is running on :50117" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0263598-06:00" level=info msg="actors: state store is not configured - this is okay for clients but services with hosted actors will fail to initialize!" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0264931-06:00" level=info msg="Configuring actors placement provider 'placement'. Configuration: 'placement:localhost:6050'" app_id=conversation instance=Incubus scope=dapr.runtime.actor type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0270241-06:00" level=info msg="Configuring actor reminders provider 'default'. Configuration: ''" app_id=conversation instance=Incubus scope=dapr.runtime.actor type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0270241-06:00" level=info msg="Actor runtime started. Idle timeout: 1h0m0s" app_id=conversation instance=Incubus scope=dapr.runtime.actor type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0270241-06:00" level=info msg="Configuring workflow engine with actors backend" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0270241-06:00" level=info msg="Registering component for dapr workflow engine..." app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0270241-06:00" level=info msg="Initializing Dapr workflow component" app_id=conversation component="dapr (workflow.dapr/v1)" instance=Incubus scope=dapr.contrib type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.027554-06:00" level=info msg="Workflow engine initialized." app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.027554-06:00" level=info msg="dapr initialized. Status: Running. Init Elapsed 47ms" app_id=conversation instance=Incubus scope=dapr.runtime type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.027554-06:00" level=info msg="Scheduler stream connected" app_id=conversation instance=Incubus scope=dapr.runtime.scheduler type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.0676801-06:00" level=info msg="Actor API level in the cluster has been updated to 10" app_id=conversation instance=Incubus scope=dapr.runtime.actor type=log ver=1.15.0-rc.1
time="2025-01-15T22:36:03.068233-06:00" level=info msg="Placement tables updated, version: 10" app_id=conversation instance=Incubus scope=dapr.runtime.actors.placement type=log ver=1.15.0-rc.1
Checking if Dapr sidecar is listening on GRPC port 50115
Dapr sidecar is up and running.
Updating metadata for appPID: 50124
Updating metadata for app command: dotnet run
You're up and running! Both Dapr and your app logs will appear here.

== APP == info: System.Net.Http.HttpClient.Default.LogicalHandler[100]
== APP ==       Start processing HTTP request POST http://localhost:50115/dapr.proto.runtime.v1.Dapr/ConverseAlpha1
== APP == info: System.Net.Http.HttpClient.Default.ClientHandler[100]
== APP ==       Sending HTTP request POST http://localhost:50115/dapr.proto.runtime.v1.Dapr/ConverseAlpha1
== APP == info: System.Net.Http.HttpClient.Default.ClientHandler[101]
== APP ==       Received HTTP response headers after 3241.804ms - 200
== APP == info: System.Net.Http.HttpClient.Default.LogicalHandler[101]
== APP ==       End processing HTTP request after 3260.3206ms - 200
== APP == info: Program[1330097018]
== APP ==       Sent prompt to conversation API: 'Please write a witty sonnet about the Dapr distributed programming framework at dapr.io'
== APP == info: Program[1283986522]
== APP ==       Received message from the conversation API: 'Here's a witty sonnet about the Dapr distributed programming framework:
== APP == 
== APP == O Dapr, thou art a framework most divine,
== APP == Distributed apps, thy specialty so fine.
== APP == With microservices, thou dost unite,
== APP == And make cloud-native dreams take flight.
== APP == 
== APP == Thy building blocks, like stars in cosmic dance,
== APP == State management, pub/sub, and more enhance.
== APP == Polyglot and platform-agnostic too,
== APP == Developers swoon, their hearts you woo.
== APP == 
== APP == From Kubernetes to edge, you scale with ease,
== APP == Your sidecar pattern doth the experts please.
== APP == Open-source and loved by geeks galore,
== APP == At dapr.io, they come to explore.
== APP == 
== APP == Though some may mock my verse as quite absurd,
== APP == I say Dapr's praises must be heard!
== APP ==       '
Exited App successfully

terminated signal received: shutting down
Exited Dapr successfully
```