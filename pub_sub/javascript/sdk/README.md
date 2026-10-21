# Dapr pub/sub with the JavaScript SDK

Publish orders from `checkout` and receive them in `order-processor` using Dapr and `@dapr/dapr` **3.19.0-rc.3**.

Learn more about [Dapr pub/sub](https://docs.dapr.io/developing-applications/building-blocks/pubsub/).

> **Note:** This example uses the Dapr SDK. For the equivalent REST calls, see the [HTTP quickstart](../http).

## What this example demonstrates

The publisher sends orders 1-5 individually with `client.pubsub.publish`, then sends orders 6-10 in one `client.pubsub.publishBulk` call. This SDK release uses the stable bulk publish API on Dapr 1.17 and newer, with compatibility handling for older runtimes. Bulk publishing does not require bulk subscribing: the subscriber still receives each order individually.

Checkout uses a gRPC client and the `DAPR_GRPC_PORT` supplied by the CLI; order-processor keeps its HTTP callback server. The sidecar handles the different transports. For this RC, prefer gRPC for SDK bulk publishing: the SDK's HTTP implementation can miss partial failures when the runtime returns `entryId` instead of the SDK's expected `entryID`. The raw-HTTP quickstart checks HTTP failures directly.

Bulk publishing can partially fail. The publisher checks `failedMessages` before reporting success. The subscriber explicitly returns `DaprPubSubStatusEnum.SUCCESS`; return `RETRY` for a recoverable failure or `DROP` to discard a message. In this SDK release, thrown callback errors are logged and retried rather than acknowledged as successful. Delivery is at least once, so real handlers must tolerate duplicates.

To also demonstrate the new JavaScript SDK **state** method `client.state.deleteBulk`, checkout temporarily saves orders 6-10 in the shared `orderstate` Redis component, verifies their values, publishes them, deletes their keys in one `DeleteBulkState` RPC, and verifies they are gone. The underlying runtime API already existed before this SDK release. This is not pub/sub message deletion, subscriber acknowledgement, or a transactional outbox. Publication and state cleanup are separate operations; a publish failure retains the state for inspection, but this sample does not implement recovery. Bulk deletion is not atomic. Missing state is returned as an empty string by the gRPC SDK's `getBulk`; an HTTP SDK client instead performs individual DELETE requests.

The [streaming example](#dynamic-streaming-subscriptions) below demonstrates the new gRPC-only `client.pubsub.subscribeStream` API separately, without replacing the normal HTTP callback example.

## Prerequisites

- Node.js 20.6 or newer and npm.
- Dapr CLI and an initialized Dapr runtime **1.17 or newer** to use the stable bulk publish API shown here.
- Redis at `localhost:6379`, normally provisioned by `dapr init`.

The SDK and runtime versions are independent: **3.19.0-rc.3** is the JavaScript package version, not a runtime requirement.

| Capability used | Runtime API availability |
| --- | --- |
| Stable bulk publishing (`BulkPublishEvent`) | [Dapr 1.17+](https://github.com/dapr/dapr/releases/tag/v1.17.0). The SDK falls back to the older alpha API on earlier runtimes. |
| Dynamic streaming subscriptions (`SubscribeTopicEventsAlpha1`) | [Dapr 1.14+](https://github.com/dapr/dapr/releases/tag/v1.14.0), as an alpha API. |
| Bulk state deletion (`DeleteBulkState`) | Already available in [Dapr 1.0](https://github.com/dapr/dapr/blob/v1.0.0/dapr/proto/runtime/v1/dapr.proto); newly exposed by this JavaScript SDK release. |

Run the following commands from this directory.

## Run with multi-app template (`dapr run -f .`)

1. Install dependencies:

<!-- STEP
name: Install Node dependencies
-->

```bash
npm ci --prefix ./order-processor &&
npm ci --prefix ./checkout
```
<!-- END_STEP -->

2. Start the publisher and subscriber:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Started Dapr with app id "order-processor-sdk"'
  - 'Started Dapr with app id "checkout-sdk"'
  - 'Published data: {"orderId":1}'
  - 'Published data: {"orderId":5}'
  - 'Saved temporary orders: 5'
  - 'Bulk published orders: 6,7,8,9,10'
  - 'Subscriber received: {"orderId":1}'
  - 'Subscriber received: {"orderId":2}'
  - 'Subscriber received: {"orderId":3}'
  - 'Subscriber received: {"orderId":4}'
  - 'Subscriber received: {"orderId":5}'
  - 'Subscriber received: {"orderId":6}'
  - 'Subscriber received: {"orderId":7}'
  - 'Subscriber received: {"orderId":8}'
  - 'Subscriber received: {"orderId":9}'
  - 'Subscriber received: {"orderId":10}'
  - 'Deleted temporary orders: 5'
  - 'Remaining temporary orders: 0'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 20
timeout_seconds: 45
-->

```bash
dapr run -f .
```
<!-- END_STEP -->

Output includes the following lines. Message ordering and duplicate deliveries can vary.

```text
Published data: {"orderId":1}
Subscriber received: {"orderId":1}
Saved temporary orders: 5
Bulk published orders: 6,7,8,9,10
Subscriber received: {"orderId":10}
Deleted temporary orders: 5
Remaining temporary orders: 0
```

3. Stop the applications:

<!-- STEP
name: Stop multi app run template
-->

```bash
dapr stop -f .
```
<!-- END_STEP -->

## Dynamic streaming subscriptions

`order-processor/stream.js` opens a subscription at runtime, publishes order 11 to `orders-stream`, waits for delivery, and closes the subscription. It publishes to its own subscription to keep this focused example self-contained. There is no application server, `/dapr/subscribe` endpoint, subscription YAML, or app port.

`subscribeStream` resolves only after Dapr confirms the subscription, so publishing starts after it is ready. Observe `subscription.closed` to detect later failures and call `subscription.close()` when finished: `client.stop()` alone does not close streams, and the SDK does not automatically reconnect. The example supplies a 15-second abort signal so it does not wait indefinitely for message delivery. The callback returns `SUCCESS` before the stream is closed.

This uses the **alpha**, gRPC-only `SubscribeTopicEventsAlpha1` API, available since runtime **1.14**. It is not available through an HTTP Dapr client. `DAPR_GRPC_PORT` is supplied by `dapr run` and is distinct from `DAPR_HTTP_PORT`.

After installing dependencies above, run this from the SDK quickstart directory:

<!-- STEP
name: Run dynamic streaming subscription
expected_stdout_lines:
  - 'Streaming subscription opened'
  - 'Streaming published data: {"orderId":11}'
  - 'Streaming subscriber received: {"orderId":11}'
  - 'Streaming subscription closed'
expected_stderr_lines:
output_match_mode: substring
match_order: none
timeout_seconds: 40
-->

```bash
cd ./order-processor &&
dapr run --app-id order-stream-sdk --resources-path ../../../components -- node stream.js &&
cd ..
```
<!-- END_STEP -->

The streaming application exits after closing its subscription; `dapr run` stops its sidecar.

## Run individually (optional)

After installing dependencies, start the subscriber in one terminal:

```bash
cd ./order-processor
npm run start:dapr
```

Then start the publisher in another terminal:

```bash
cd ./checkout
npm run start:dapr
```

These scripts use `--resources-path ../../../components` relative to their app folders and the same app IDs as `dapr.yaml`. Stop the applications when finished:

```bash
dapr stop --app-id checkout-sdk
dapr stop --app-id order-processor-sdk
```
