# Dapr pub/sub with streaming subscriptions

Publish orders one at a time and in bulk with the Dapr .NET SDK, and receive them over application-initiated gRPC streams.

See the [Dapr pub/sub overview](https://docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-overview/) and [streaming subscriptions](https://docs.dapr.io/developing-applications/building-blocks/pubsub/subscription-methods/#streaming-subscriptions) for more information.

> **Note:** This example has no HTTP subscriber routes, `/dapr/subscribe` endpoint, subscription attributes, or subscription YAML. Compare it with the [programmatic](../programmatic) and [declarative](../declarative) examples. For plain HTTP publishing, see the [HTTP example](../../http).

## How it works

The `order-processor` is a console worker, not a web application. Its `OrderSubscriber` background service calls `DaprPublishSubscribeClient.SubscribeAsync` twice:

| Pub/sub component | Topic | Messages |
| --- | --- | --- |
| `orderpubsub` | `orders-streaming` | Orders 1-3, published individually |
| `orderpubsub` | `orders-bulk-streaming` | Orders 4-6, published in one bulk request |

Each call opens a dynamic subscription and returns an asynchronously disposable handle. The handler deserializes `TopicMessage.Data` and returns `TopicResponseAction.Success` after processing each order. The message-handling policy requests a retry if handling fails or exceeds ten seconds, and subscription errors are written to standard error. The .NET host manages shutdown; the worker disposes both subscriptions to close their streams.

The `checkout` publisher uses `PublishEventAsync` for orders 1-3 and `BulkPublishEventAsync` for orders 4-6, checking the bulk response for failures before reporting success.

A running sidecar does not guarantee that the subscriber has opened its streams. The publisher repeats the same six sample orders every five seconds, so the subscriber can receive a complete set even if publishing starts before its subscriptions are ready. Both applications keep running until stopped. The subscriber needs no `appPort` or fixed Dapr HTTP port.

Both apps reuse the shared Redis [pub/sub component](../../../components/pubsub.yaml). The declarative subscription files in that directory are scoped to a different app ID and do not apply here.

**Bulk publishing does not change streaming delivery:** the publish request is batched, but the handler processes and acknowledges each order separately.

## Prerequisites

- .NET 10 SDK.
- Dapr CLI and initialized runtime matching [the repository's pinned versions](../../../../.github/env/global.env).
- A container runtime with the Redis instance started by `dapr init`, reachable at `localhost:6379`.

## Run with the multi-app template (`dapr run -f .`)

Run these commands from `pub_sub/csharp/sdk/streaming`.

1. Build both applications. The template uses `--no-build` to keep compilation outside the timed example.

<!-- STEP
name: Build streaming pubsub apps
expected_stdout_lines:
  - 'Build succeeded.'
  - 'Build succeeded.'
expected_stderr_lines:
output_match_mode: substring
timeout_seconds: 180
-->

```bash
dotnet build order-processor
dotnet build checkout
```

<!-- END_STEP -->

2. Start the subscriber and publisher with the multi-app template.

<!-- STEP
name: Publish and receive single and bulk orders through streaming subscriptions
expected_stdout_lines:
  - 'Started Dapr with app id "order-processor-streaming-sdk"'
  - 'Started Dapr with app id "checkout-streaming-sdk"'
  - 'Streaming subscriptions opened.'
  - 'Published single order: Order { OrderId = 1 }'
  - 'Published single order: Order { OrderId = 2 }'
  - 'Published single order: Order { OrderId = 3 }'
  - 'Bulk published order: Order { OrderId = 4 }'
  - 'Bulk published order: Order { OrderId = 5 }'
  - 'Bulk published order: Order { OrderId = 6 }'
  - 'Subscriber received single order: Order { OrderId = 1 }'
  - 'Subscriber received single order: Order { OrderId = 2 }'
  - 'Subscriber received single order: Order { OrderId = 3 }'
  - 'Subscriber received bulk-published order: Order { OrderId = 4 }'
  - 'Subscriber received bulk-published order: Order { OrderId = 5 }'
  - 'Subscriber received bulk-published order: Order { OrderId = 6 }'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 40
timeout_seconds: 60
-->

```bash
dapr run -f .
```

<!-- END_STEP -->

Output includes these lines for each round of orders after the subscriptions open. Delivery order may vary, and Dapr's at-least-once delivery can produce additional duplicates.

```text
Streaming subscriptions opened.
Published single order: Order { OrderId = 1 }
Subscriber received single order: Order { OrderId = 1 }
Bulk published order: Order { OrderId = 4 }
Subscriber received bulk-published order: Order { OrderId = 4 }
```

3. Stop the applications and their Dapr sidecars.

<!-- STEP
name: Stop streaming pubsub apps
expected_stdout_lines:
expected_stderr_lines:
output_match_mode: substring
timeout_seconds: 30
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->
