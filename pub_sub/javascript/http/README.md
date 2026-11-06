# Dapr pub/sub over HTTP

Publish orders from `checkout` and receive them in `order-processor` using Dapr's HTTP APIs, without installing the Dapr SDK.

Learn more about [Dapr pub/sub](https://docs.dapr.io/developing-applications/building-blocks/pubsub/).

> **Note:** For the SDK equivalents and the new features in `@dapr/dapr` 3.19.0, see the [SDK quickstart](../sdk).

## What this example demonstrates

Checkout publishes orders 1-5 individually to `POST /v1.0/publish/orderpubsub/orders`, then orders 6-10 to the stable `POST /v1.0/publish/bulk/orderpubsub/orders` API. Each bulk entry has an `entryId`, `event`, and `contentType`. The stable endpoint requires Dapr 1.17 or newer; unlike the SDK, this example does not select an older alpha endpoint.

Bulk publishing can partially fail. HTTP errors, including partial-failure responses, terminate the publisher with a nonzero exit code and include the response details. Bulk publishing does not require bulk subscribing: the subscriber advertises its `orders` route at `/dapr/subscribe` and receives individual CloudEvents. It responds with `SUCCESS` after handling each event or `RETRY` on a processing exception. Delivery is at least once; real handlers must tolerate duplicates.

**Dynamic streaming subscriptions are gRPC-only.** The SDK's new `subscribeStream` API has no HTTP equivalent, and changing `/dapr/subscribe` after startup does not create a streaming subscription. Try the [SDK streaming example](../sdk#dynamic-streaming-subscriptions) for runtime subscribe/close behavior without an application server.

## Prerequisites

- Node.js 20 or newer and npm.
- Dapr CLI and an initialized Dapr runtime **1.17 or newer**, which provides the [stable bulk publish API](https://github.com/dapr/dapr/releases/tag/v1.17.0).
- Redis at `localhost:6379`, normally provisioned by `dapr init`.

Run the following commands from this directory.

The JavaScript SDK version **3.19.0** adds SDK access to existing runtime capabilities; it does not require a matching runtime version. This HTTP example does not depend on the SDK.

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
  - 'Started Dapr with app id "order-processor-http"'
  - 'Started Dapr with app id "checkout-http"'
  - 'Published data: {"orderId":1}'
  - 'Published data: {"orderId":5}'
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
Bulk published orders: 6,7,8,9,10
Subscriber received: {"orderId":10}
```

3. Stop the applications:

<!-- STEP
name: Stop multi app run template
-->

```bash
dapr stop -f .
```
<!-- END_STEP -->

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
dapr stop --app-id checkout-http
dapr stop --app-id order-processor-http
```
