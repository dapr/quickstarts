# Dapr pub/sub with declarative subscriptions

Publish orders one at a time and in bulk with the Dapr .NET SDK, and receive them through subscriptions defined exclusively in YAML.

See the [Dapr pub/sub overview](https://docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-overview/) and [declarative subscriptions](https://docs.dapr.io/developing-applications/building-blocks/pubsub/subscription-methods/#declarative-subscriptions) for more information.

> **Note:** This example has no subscription attributes, `/dapr/subscribe` endpoint, or streaming subscriptions. For plain HTTP publishing, see the [HTTP example](../http).

For subscriptions defined in application code, compare the [programmatic](../sdk-programmatic) and [streaming](../sdk-streaming) examples.

## How it works

The `checkout` publisher uses `Dapr.Messaging` to publish orders 1-3 with individual `PublishEventAsync` calls, then orders 4-6 with one `BulkPublishEventAsync` call. It checks the bulk response for failed entries before reporting success.

The `order-processor` subscriber exposes two HTTP routes. Dapr loads the shared Redis [pub/sub component](../../components/pubsub.yaml) and these subscription resources:

| Subscription | Topic | Subscriber route |
| --- | --- | --- |
| [Single orders](../../components/orders-declarative.yaml) | `orders-declarative` | `/orders` |
| [Bulk-published orders](../../components/orders-bulk-declarative.yaml) | `orders-bulk-declarative` | `/orders-bulk` |

Each subscription's `scopes` limits delivery to `order-processor-declarative-sdk`, so other quickstarts do not subscribe to these topics. The publisher does not register subscriptions.

**Bulk publishing is independent of bulk subscription delivery.** This example batches the publish request, not the subscriber callback: both subscriptions deliver one CloudEvent per HTTP request. The subscriber reads the order from `CloudEvent<Order>.Data` and acknowledges it with HTTP 200. It does not need CloudEvent-unwrapping middleware.

## Prerequisites

- .NET 10 SDK.
- Dapr CLI and initialized runtime matching [the repository's pinned versions](../../../.github/env/global.env).
- A container runtime with the Redis instance started by `dapr init`, reachable at `localhost:6379`.

## Run with the multi-app template (`dapr run -f .`)

Run these commands from `pub_sub/csharp/sdk-declarative`.

1. Build both applications. The template uses `--no-build` so package restore and compilation are completed before the timed example begins.

<!-- STEP
name: Build declarative pubsub apps
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
name: Publish and receive single and bulk orders through YAML subscriptions
expected_stdout_lines:
  - 'Started Dapr with app id "order-processor-declarative-sdk"'
  - 'Started Dapr with app id "checkout-declarative-sdk"'
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

The publisher exits after sending all six orders. The subscriber keeps running. Output includes the following lines; delivery order may vary, and Dapr's at-least-once delivery can produce duplicates.

```text
Published single order: Order { OrderId = 1 }
Subscriber received single order: Order { OrderId = 1 }
Bulk published order: Order { OrderId = 4 }
Subscriber received bulk-published order: Order { OrderId = 4 }
```

3. Stop the applications and their Dapr sidecars.

<!-- STEP
name: Stop declarative pubsub apps
expected_stdout_lines:
expected_stderr_lines:
output_match_mode: substring
timeout_seconds: 30
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->
