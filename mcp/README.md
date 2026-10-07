# Dapr MCP server quickstarts

The [Dapr MCP server](https://github.com/dapr/dapr-mcp-server) is a [Model Context Protocol](https://modelcontextprotocol.io/) server that sits in front of a Dapr sidecar and hands AI agents Dapr's building blocks as tools: state, pub/sub, secrets, service invocation, actors, bindings, locks, cryptography and conversation. It only registers the tools for the components the sidecar has loaded, so an agent sees exactly what the application can use.

These quickstarts run the same scenario in three agent frameworks, so you can compare them side by side. Each agent is asked to remember a user preference: it calls `get_components` to discover the component names, saves the preference with `save_state`, reads it back with `get_state` and announces it with `publish_event`.

| Quickstart | Framework | MCP client |
|:--|:--|:--|
| [python/langgraph](./python/langgraph) | [LangGraph](https://langchain-ai.github.io/langgraph/) | `langchain-mcp-adapters` |
| [python/dapr-agents](./python/dapr-agents) | [Dapr Agents](https://docs.dapr.io/developing-ai/dapr-agents/) | `dapr_agents.tool.mcp.MCPClient` |
| [python/openai-agents](./python/openai-agents) | [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) | `agents.mcp.MCPServerStdio` |

All three load the Dapr components in [`components`](./components): a Redis state store, Redis pub/sub and a local file secret store with one dummy secret. With those loaded, the MCP server exposes 11 tools.

Visit the [Dapr MCP server documentation](https://docs.dapr.io/developing-ai/mcp/) for the full tool reference and configuration options.

## Install the Dapr MCP server

The quickstarts expect the `dapr-mcp-server` binary on your `PATH`. Install it with Go 1.26.6 or later:

```bash
go install github.com/dapr/dapr-mcp-server/cmd/dapr-mcp-server@v0.0.1
export PATH="$PATH:$(go env GOPATH)/bin"
```

The agents call an OpenAI model, so set `OPENAI_API_KEY` before running them.

## Transports

The Dapr MCP server speaks MCP over **stdio** by default, or over **streamable HTTP** when started with `--http <addr>`.

These quickstarts use **stdio**. Each agent runs under `dapr run` and starts `dapr-mcp-server` as a child process, passing on its sidecar's `DAPR_GRPC_PORT` so the server talks to the same sidecar. There is one app per quickstart, no port to pick and no start-up race between the agent and the server.

Streamable HTTP suits a server shared by several agents, or one that runs remotely. Run the server as its own Dapr app. Start it from one of the `agent` folders, because the secret store finds its file relative to the directory the sidecar starts in:

```bash
cd python/langgraph/agent
dapr run --app-id dapr-mcp-server --resources-path ../../../components -- dapr-mcp-server --http :8080
```

Then connect any MCP client to `http://localhost:8080/`. Each quickstart's README shows the one-line change to its client. Health probes are served on `/livez`, `/readyz` and `/startupz`.

## Use the Dapr MCP server from Claude Desktop or Cursor

Desktop MCP clients start the server over stdio themselves, so the server needs a Dapr sidecar to connect to. Start one without an app, on a fixed gRPC port, from one of the `agent` folders as above:

```bash
cd python/langgraph/agent
dapr run --app-id dapr-mcp --dapr-grpc-port 50001 --resources-path ../../../components
```

Then add the server to the client's MCP configuration: `claude_desktop_config.json` for Claude Desktop, or `.cursor/mcp.json` for Cursor.

```json
{
  "mcpServers": {
    "dapr": {
      "command": "/absolute/path/to/dapr-mcp-server",
      "env": {
        "DAPR_GRPC_PORT": "50001"
      }
    }
  }
}
```

Use the absolute path that `which dapr-mcp-server` prints, because desktop apps don't always inherit your shell's `PATH`.

## About CI

The agents need an OpenAI API key and the `dapr-mcp-server` binary, and the LLM's replies are not deterministic, so the repository's CI does not run these quickstarts. Each README is still written as a [mechanical-markdown](https://github.com/dapr/mechanical-markdown) script: with Dapr initialized, the binary installed and `OPENAI_API_KEY` set, run `make validate` in a quickstart folder to execute it. The checked output avoids the LLM's wording: each app confirms the saved preference with its own `get_state` call.
