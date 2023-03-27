# Dapr resiliency

Dapr provides a capability for defining and applying fault tolerance resiliency policies (retries/back-offs, timeouts and circuit breakers) via a resiliency spec. Resiliency specs are saved in the same location as components specs and are applied when the Dapr sidecar starts. The sidecar determines how to apply resiliency policies to your Dapr API calls.

In this Quickstart, you will observe Dapr resiliency capabilities by simulating a system failure. You have the option of using the service invocation quickstarts to demonstrate Dapr resiliency between service-to-service communication, or the state management quickstart to demonstrate resiliency between apps and components. 

### Select resiliency quickstart

- For service-to-service resiliency, see [here](./service-to-service-resiliency.md)
- For service-to-component resiliency, see [here](./service-to-component-resiliency.md)
