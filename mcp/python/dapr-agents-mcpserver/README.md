# Dapr MCP server with Dapr Agents, through the MCPServer resource

In this quickstart, a [Dapr Agents](https://docs.dapr.io/developing-ai/dapr-agents/) agent uses the [Dapr MCP server](https://github.com/dapr/dapr-mcp-server) through Dapr's [`MCPServer` resource](https://docs.dapr.io/developing-ai/mcp/mcp-server-resource/). The agent is asked to remember a user preference, so it:

1. calls `get_components` to discover the state store and pub/sub component names,
2. saves the preference with `save_state`,
3. reads it back with `get_state`,
4. announces it with `publish_event`.

The app has no MCP client. Its Dapr sidecar connects to the MCP server and registers a workflow for each tool, and the app calls a tool by starting that workflow. Dapr Agents supports the `MCPServer` resource natively: the `DurableAgent` is created without any tools, finds the `MCPServer` in its sidecar's metadata, and loads the tools itself. Each run of the agent is a Dapr workflow, and each tool call runs as a child workflow of it, so the tool calls are durable steps of the agent's run.

Visit the [Dapr MCP server documentation](https://docs.dapr.io/developing-ai/mcp/) for more information.

> **Note:** The [stdio version of this quickstart](../dapr-agents) runs the same scenario with an MCP client in the app. The same scenario through the `MCPServer` resource is also implemented with [LangGraph](../langgraph-mcpserver) and the [OpenAI Agents SDK](../openai-agents-mcpserver). See the [MCP quickstarts overview](../../README.md) for how they compare.

## Prerequisites

- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/), initialized with `dapr init` and Dapr runtime 1.18 or later (this provides the local Redis used by the components)
- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- [Go](https://go.dev/doc/install) 1.26.6 or later, to install the Dapr MCP server
- An OpenAI API key

Install the Dapr MCP server and make sure it is on your `PATH`:

```bash
go install github.com/dapr/dapr-mcp-server/cmd/dapr-mcp-server@v0.0.1
export PATH="$PATH:$(go env GOPATH)/bin"
```

Set your OpenAI API key:

```bash
export OPENAI_API_KEY=<your-api-key>
```

The agent uses `gpt-4o-mini` by default. Set `OPENAI_MODEL` to use a different model.

## How the agent reaches Dapr

The sidecar loads the components in [`../../components`](../../components) and the `MCPServer` resource in [`../../mcpserver-resources`](../../mcpserver-resources). The resource tells the sidecar to start `dapr-mcp-server` as a child process and speak MCP to it over stdio, with `DAPR_GRPC_PORT` pointing back at the same sidecar. That is why [`dapr.yaml`](./dapr.yaml) fixes the sidecar's gRPC port at `50101`. The three `MCPServer` quickstarts all use that port, so run only one at a time.

The sidecar's API is already serving when it loads the `MCPServer` resource, so the MCP server finds the state store, pub/sub and secret store and registers 11 tools. The sidecar then registers these workflows:

- `dapr.internal.mcp.dapr.ListTools`, which returns the tool list,
- `dapr.internal.mcp.dapr.CallTool.<tool>`, one per tool, which takes `{"arguments": {...}}` and returns the MCP `CallToolResult`.

The sidecar runs these workflows itself. The agent's own workflow state is kept in the `statestore` component, which is marked as the actor state store.

## Run with multi-app template (`dapr run -f .`)

This section uses [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) to run the agent with `dapr run -f .`.

1. Install dependencies:

<!-- STEP
name: Install Python dependencies
-->

```bash
uv sync
```

<!-- END_STEP -->

2. Run the agent with Dapr:

<!-- STEP
name: Run the Dapr Agents agent
expected_stdout_lines:
  - "Loaded 11 tools from the Dapr MCP server"
  - "Verified in state store: favorite-color = blue"
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 60
timeout_seconds: 120
-->

```bash
uv run dapr run -f .
```

<!-- END_STEP -->

The agent's reply is written by the LLM, so its wording changes from run to run. The last line is checked without the LLM: the app starts the `get_state` tool's workflow itself to confirm the preference is in the state store.

```text
== APP - preference-agent-dapr-agents-mcpserver == Loaded 11 tools from the Dapr MCP server
== APP - preference-agent-dapr-agents-mcpserver == Agent reply: I saved your favorite color, blue, to the statestore under 'favorite-color', confirmed it, and announced it on the 'user-preferences' topic.
== APP - preference-agent-dapr-agents-mcpserver == Verified in state store: favorite-color = blue
```

3. Stop the app:

<!-- STEP
name: Stop multi-app run
sleep: 5
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->

## Run the app individually (optional)

```bash
uv sync
cd agent
dapr run --app-id preference-agent-dapr-agents-mcpserver --dapr-grpc-port 50101 \
  --resources-path ../../../components/ --resources-path ../../../mcpserver-resources/ \
  -- uv run python app.py
```

## Call the tools without an agent

Any app can call the tools through the sidecar's workflow API, with no SDK. With the app running individually as above, list the tools from another terminal:

```bash
curl -X POST http://localhost:<dapr-http-port>/v1.0-beta1/workflows/dapr/dapr.internal.mcp.dapr.ListTools/start -d '{}'
```

Then call one, and read the result from the workflow's `dapr.workflow.output` property:

```bash
curl -X POST http://localhost:<dapr-http-port>/v1.0-beta1/workflows/dapr/dapr.internal.mcp.dapr.CallTool.get_state/start \
  -d '{"arguments": {"storeName": "statestore", "key": "favorite-color"}}'
curl http://localhost:<dapr-http-port>/v1.0-beta1/workflows/dapr/<instanceID>
```

`dapr list` shows the sidecar's HTTP port.

## About CI

This quickstart needs an OpenAI API key and the `dapr-mcp-server` binary, so the repository's CI does not run it. Run `make validate` locally, with both in place, to execute the steps above.
