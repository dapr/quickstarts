# Dapr MCP server with the OpenAI Agents SDK

In this quickstart, an [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) agent uses the [Dapr MCP server](https://github.com/dapr/dapr-mcp-server) to work with Dapr building blocks. The agent is asked to remember a user preference, so it:

1. calls `get_components` to discover the state store and pub/sub component names,
2. saves the preference with `save_state`,
3. reads it back with `get_state`,
4. announces it with `publish_event`.

The agent connects to the MCP tools with the SDK's built-in `MCPServerStdio` and lists the server in its `mcp_servers`, so the SDK fetches the tool list and routes every tool call to the server.

Visit the [Dapr MCP server documentation](https://docs.dapr.io/developing-ai/mcp/) for more information.

> **Note:** The same scenario is implemented with [LangGraph](../langgraph) and [Dapr Agents](../dapr-agents). See the [MCP quickstarts overview](../../README.md) for how they compare.

## Prerequisites

- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/), initialized with `dapr init` (this provides the local Redis used by the components)
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

The agent starts `dapr-mcp-server` itself, as a child process that speaks MCP over stdio. The agent runs under `dapr run`, so it has its own Dapr sidecar, and it passes the sidecar's `DAPR_GRPC_PORT` and `DAPR_HTTP_PORT` on to the MCP server. The MCP server then registers tools for the components that sidecar has loaded from [`../../components`](../../components): a Redis state store, Redis pub/sub and a local file secret store.

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
name: Run the OpenAI Agents SDK agent
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

The agent's reply is written by the LLM, so its wording changes from run to run. The last line is checked without the LLM: the app calls `get_state` itself to confirm the preference is in the state store.

```text
== APP - preference-agent-openai-agents == Loaded 11 tools from the Dapr MCP server
== APP - preference-agent-openai-agents == Agent reply: I saved your favorite color, blue, to the statestore under 'favorite-color', confirmed it, and announced it on the 'user-preferences' topic.
== APP - preference-agent-openai-agents == Verified in state store: favorite-color = blue
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
dapr run --app-id preference-agent-openai-agents --resources-path ../../../components/ -- uv run python app.py
```

## Connect over streamable HTTP instead

To share one MCP server between several agents, run `dapr-mcp-server` as its own Dapr app with `--http`, and point the client at it:

```python
from agents.mcp import MCPServerStreamableHttp

server = MCPServerStreamableHttp(name="dapr", params={"url": "http://localhost:8080/"})
```

See the [MCP quickstarts overview](../../README.md#transports) for the full command.

## About CI

This quickstart needs an OpenAI API key and the `dapr-mcp-server` binary, so the repository's CI does not run it. Run `make validate` locally, with both in place, to execute the steps above.
