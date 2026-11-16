# Dapr resiliency

Dapr provides a capability for defining and applying fault tolerance resiliency policies (retries/back-offs, timeouts and circuit breakers) via a resiliency spec. Resiliency specs are saved in the same location as components specs and are applied when the Dapr sidecar starts. The sidecar determines how to apply resiliency policies to your Dapr API calls.

In this Quickstart, you will observe Dapr resiliency capabilities by simulating a system failure. You have the option of using the service invocation quickstarts to demonstrate Dapr resiliency between service-to-service communication, or the state management quickstart to demonstrate resiliency between apps and components. 

### Select resiliency quickstart

- For service-to-service resiliency, see [here](./service-to-service-resiliency.md)
- For service-to-component resiliency, see [here](./service-to-component-resiliency.md)
### Build resiliency policies with the Dapr Dev Dashboard

The free [Dapr Dev Dashboard](https://docs.dapr.io/developing-applications/local-development/dapr-dev-dashboard/) has a resiliency builder: instead of writing `resiliency.yaml` by hand, you compose timeouts, retries, and circuit breakers in a wizard, apply them to targets (apps, components, actors), and copy or download the generated YAML.

1. [Install the dashboard](https://github.com/diagridio/dev-dashboard#installation-instructions), then start it in a separate terminal while you work through either quickstart:

    ```sh
    diagrid-dev-dashboard
    ```

    This opens http://localhost:9090 in your browser.

2. Go to the **Resiliency** page and open the builder.
3. Recreate the policy used by the quickstart you picked, or change the retry and circuit breaker settings and rerun the fault scenario.

The Dev Dashboard is a local development tool. It is not intended for Kubernetes, production, or any shared environment.

