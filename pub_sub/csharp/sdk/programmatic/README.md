# Dapr pub/sub with programmatic subscriptions

Publish orders one at a time and in bulk with the Dapr .NET SDK, and receive them through subscriptions advertised by the application.

See the [Dapr pub/sub overview](https://docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-overview/) and [programmatic subscriptions](https://docs.dapr.io/developing-applications/building-blocks/pubsub/subscription-methods/#programmatic-subscriptions) for more information.

> **Note:** This example implements `/dapr/subscribe` explicitly to show the subscription-discovery contract. For other subscription methods, see the [declarative](../declarative) and [streaming](../streaming) examples. For plain HTTP publishing, see the [HTTP example](../../http).

## How it works

The `checkout` publisher uses `Dapr.Messaging` to publish orders 1-3 with individual `PublishEventAsync` calls, then orders 4-6 with one `BulkPublishEventAsync` call. It checks the bulk response for failed entries before reporting success.

At startup, Dapr calls the `order-processor` application's `GET /dapr/subscribe` endpoint. The JSON response tells Dapr which topics to subscribe to and where to deliver each message:

| Pub/sub component | Topic | Subscriber route |
| --- | --- | --- |
| `orderpubsub` | `orders-programmatic` | `/orders` |
| `orderpubsub` | `orders-bulk-programmatic` | `/orders-bulk` |

Both apps reuse the shared Redis [pub/sub component](../../../components/pubsub.yaml). No subscription YAML is needed for these topics, and no streaming subscriptions are opened. The declarative subscription files in the shared components directory are scoped to a different app ID and do not apply here.

**Bulk publishing is independent of bulk subscription delivery.** This example batches the publish request, not the subscriber callback: both subscriptions deliver one CloudEvent per HTTP request. The subscriber reads the order from `CloudEvent<Order>.Data` and acknowledges it with HTTP 200.

## Prerequisites

- .NET 10 SDK.
- Dapr CLI and initialized runtime matching [the repository's pinned versions](../../../../.github/env/global.env).
- A container runtime with the Redis instance started by `dapr init`, reachable at `localhost:6379`.

## Run with the multi-app template (`dapr run -f .`)

Run these commands from `pub_sub/csharp/sdk/programmatic`.

1. Build both applications. The template uses `--no-build` to keep compilation outside the timed example.

<!-- STEP
name: Build programmatic pubsub apps
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
name: Publish and receive single and bulk orders through programmatic subscriptions
expected_stdout_lines:
  - 'Started Dapr with app id "order-processor-programmatic-sdk"'
  - 'Started Dapr with app id "checkout-programmatic-sdk"'
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
sleep: 20
timeout_seconds: 60
-->

```bash
dapr run -f .
```

<!-- END_STEP -->

The publisher exits after sending all six orders. The subscriber keeps running. Output includes these lines; delivery order may vary, and Dapr's at-least-once delivery can produce duplicates.

```text
Published single order: Order { OrderId = 1 }
Subscriber received single order: Order { OrderId = 1 }
Bulk published order: Order { OrderId = 4 }
Subscriber received bulk-published order: Order { OrderId = 4 }
```

3. Stop the applications and their Dapr sidecars.

<!-- STEP
name: Stop programmatic pubsub apps
expected_stdout_lines:
expected_stderr_lines:
output_match_mode: substring
timeout_seconds: 30
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->
