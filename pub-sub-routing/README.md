# Dapr Pub-Sub routing

In this quickstart, you'll run a subscriber application that makes use of Pub-Sub routing. The application can be quickly changed to:

* Toggle between programmatic and declarative subscriptions (or use both as long as there is no overlap)
* Add other routing rules with different [CEL](https://github.com/google/cel-spec) expressions
* Enable/disable routing (disable `PubSub.Routing` in `config.yaml`)

> **Note**: Because this example is intended to be something to play around with, it makes use of the `in-memory` pubsub component and is not intended to be deployed to Kubernetes.

**Install dependencies**

<!-- STEP
name: Install node dependencies
working_dir: .
-->

```bash
npm install
```

<!-- END_STEP -->

**Run the application**

<!-- STEP
name: Run node subscriber
expected_stdout_lines:
  - "WIDGET:"
  - "GADGET:"
  - "PRODUCT (default):"
expected_stderr_lines:
output_match_mode: substring
working_dir: .
background: true
sleep: 5
-->

```bash
dapr run --app-id pubsub-routing --config config.yaml --components-path ./components --app-port 3000 node app.js
```

<!-- END_STEP -->

**Switch between programmatic and declarative subscriptions**

In `app.js`, the handler for `/dapr/subscribe` returns the programmatic subscriptions. The contents are commented out to demonstrate usage of a declarative subscription in `components/subscription.yaml`.

You can switch from declarative to programmatic subscriptions by:

1) Changing `kind: Subscription` to `kind: Subscription_disabled` in `components/subscription.yaml` so that `daprd` does not load the file
2) Uncommenting the JSON response for `/dapr/subscribe` in `app.js`
3) Stop (CTRL-C) and restart the application using the `dapr run` command above

**Publish messages to route**

Try the following `curl` commands in a separate terminal.

Publish a widget

<!-- STEP
name: Curl publish message
expected_stdout_lines:
  - "OK"
  - "OK"
  - "OK"
expected_stderr_lines:
-->

```bash
curl -s http://localhost:3000/publish -H Content-Type:application/json --data @messages/widget.json
```

Publish a gadget

```bash
curl -s http://localhost:3000/publish -H Content-Type:application/json --data @messages/gadget.json
```

Publish a thingamajig

```bash
curl -s http://localhost:3000/publish -H Content-Type:application/json --data @messages/thingamajig.json
```

<!-- END_STEP -->

<!-- STEP
expected_stdout_lines: 
  - 'app stopped successfully: pubsub-routing'
expected_stderr_lines:
output_match_mode: substring
name: Shutdown dapr
-->

```bash
dapr stop --app-id pubsub-routing
```

<!-- END_STEP -->