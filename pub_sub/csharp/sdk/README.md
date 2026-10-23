# Dapr pub/sub with the .NET SDK

Publish orders individually and in bulk, then receive them using one of Dapr's three subscription methods.

Start with the [programmatic subscriptions quickstart](programmatic), which defines subscriptions in application code. Each example includes its own multi-app template and runnable walkthrough:

| Subscription method | How the subscriber registers |
| --- | --- |
| [Programmatic](programmatic) | An HTTP `/dapr/subscribe` endpoint |
| [Declarative](declarative) | YAML subscription resources |
| [Streaming](streaming) | Application-initiated gRPC streams |

See the [Dapr pub/sub overview](https://docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-overview/) for more information. For publishing without the SDK, see the [HTTP example](../http).
