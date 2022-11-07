# Dapr Resiliency

In this Quickstart, you will observe Dapr resiliency capabilities by simulating a system failure. You will run a microservice application that continuously persists and retrieves state via Dapr's state management API. When operations to the state store begin to fail, Dapr resiliency policies are applied.

Visit [this](https://docs.dapr.io/operations/resiliency/resiliency-overview//) link for more information about Dapr resiliency.

This quickstart includes one service:

- Node client service `order-processor` 
- Redis component spec
- Resiliency spec

### Run Node service with Dapr

1. Navigate to folder and install dependencies: 

<!-- STEP
name: Install Node dependencies
-->

```bash
cd ./order-processor
npm install
```
<!-- END_STEP -->

2. Run the Node service app with Dapr and enable resiliency via the config.yaml: 

<!-- STEP
name: Run Node publisher
expected_stdout_lines:
  - "== APP == Saving Order:  { orderId: '1' }"
  - "== APP == Getting Order:  { orderId: '1' }"
  - "Exited App successfully"
expected_stderr_lines:
working_dir: ./order-processor
output_match_mode: substring
background: true
sleep: 10
-->

```bash
dapr run --app-id order-processor --config ../config.yaml --components-path ../components/ -- npm start
```

<!-- STEP
name: Run Node publisher
expected_stdout_lines:
  - "== APP == Saving Order:  { orderId: '1' }"
  - "== APP == Getting Order:  { orderId: '1' }"
  - "Exited App successfully"
expected_stderr_lines:
working_dir: ./order-processor
output_match_mode: substring
background: true
sleep: 10
-->

Expected output: 
```bash
== APP == Saving Order:  { orderId: '1' }
== APP == Getting Order:  { orderId: '1' }
== APP == Saving Order:  { orderId: '2' }
== APP == Getting Order:  { orderId: '2' }
== APP == Saving Order:  { orderId: '3' }
== APP == Getting Order:  { orderId: '3' }
== APP == Saving Order:  { orderId: '4' }
== APP == Getting Order:  { orderId: '4' }
```
<!-- END_STEP -->

### Stop Redis container instance 

```bash
docker stop dapr_redis
```

### Observe retry and circuit breaker policies are applied:

```bash
INFO[0006] Error processing operation component[statestore] output. Retrying... 
INFO[0026] Circuit breaker "simpleCB-statestore" changed state from closed to open
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from open to half-open
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from half-open to open
```

### Restart the Redis container instance:

```bash
docker start dapr_redis
```

### Observe orders have resumed sequentially:

```bash
INFO[0036] Recovered processing operation component[statestore] output.
== APP == Saving Order:  { orderId: '5' }
== APP == Getting Order:  { orderId: '5' }
== APP == Saving Order:  { orderId: '6' }
== APP == Getting Order:  { orderId: '6' }
== APP == Saving Order:  { orderId: '7' }
== APP == Getting Order:  { orderId: '7' }
== APP == Saving Order:  { orderId: '8' }
== APP == Getting Order:  { orderId: '8' }
== APP == Saving Order:  { orderId: '9' }
== APP == Getting Order:  { orderId: '9' }
```