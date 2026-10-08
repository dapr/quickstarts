# Dapr MCP server quickstarts

The [Dapr MCP server](https://github.com/dapr/dapr-mcp-server) is a [Model Context Protocol](https://modelcontextprotocol.io/) server that sits in front of a Dapr sidecar and hands AI agents Dapr's building blocks as tools: state, pub/sub, secrets, service invocation, actors, bindings, locks, cryptography and conversation. It only registers the tools for the components the sidecar has loaded, so an agent sees exactly what the application can use.

These quickstarts run the same scenario in three agent frameworks, so you can compare them side by side. Each agent is asked to remember a user preference: it calls `get_components` to discover the component names, saves the preference with `save_state`, reads it back with `get_state` and announces it with `publish_event`.

Each framework reaches the MCP server in one of two ways:

- **MCP client in the app.** The app runs an MCP client, as it would for any MCP server, and starts `dapr-mcp-server` itself over stdio. Nothing changes for an existing agent, and it works with any framework and any Dapr version.
- **Dapr's `MCPServer` resource.** The app has no MCP client. Its sidecar loads an [`MCPServer` resource](https://docs.dapr.io/developing-ai/mcp/mcp-server-resource/), connects to the MCP server and registers a Dapr workflow per tool, and the app calls a tool by starting that workflow. Each tool call is then a durable workflow, with Dapr's retries, per-tool tracing and access policies, and optional middleware hooks for audit or redaction. It needs Dapr 1.18 or later.

| Framework | MCP client in the app | `MCPServer` resource |
|:--|:--|:--|
| [LangGraph](https://langchain-ai.github.io/langgraph/) | [python/langgraph](./python/langgraph), with `langchain-mcp-adapters` | [python/langgraph-mcpserver](./python/langgraph-mcpserver), with a short adapter over `DaprMCPClient` |
| [Dapr Agents](https://docs.dapr.io/developing-ai/dapr-agents/) | [python/dapr-agents](./python/dapr-agents), with `dapr_agents.tool.mcp.MCPClient` | [python/dapr-agents-mcpserver](./python/dapr-agents-mcpserver), built in: `DurableAgent` finds the resource itself |
| [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) | [python/openai-agents](./python/openai-agents), with `agents.mcp.MCPServerStdio` | [python/openai-agents-mcpserver](./python/openai-agents-mcpserver), with a short adapter over `DaprMCPClient` |

Start with the MCP client path unless you want what the workflows add. All six quickstarts load the Dapr components in [`components`](./components): a Redis state store, Redis pub/sub and a local file secret store with one dummy secret. With those loaded, the MCP server exposes 11 tools. The `MCPServer` quickstarts also load [`mcpserver-resources`](./mcpserver-resources), which is scoped to their app IDs.

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

These quickstarts use **stdio**. In the MCP client quickstarts, each agent runs under `dapr run` and starts `dapr-mcp-server` as a child process, passing on its sidecar's `DAPR_GRPC_PORT` so the server talks to the same sidecar. There is one app per quickstart, no port to pick and no start-up race between the agent and the server.

In the `MCPServer` quickstarts, the sidecar starts `dapr-mcp-server` as its own child process, using the `stdio` endpoint in [`mcpserver-resources/mcpserver.yaml`](./mcpserver-resources/mcpserver.yaml). The resource sets `DAPR_GRPC_PORT` so the server calls back into the same sidecar, and each quickstart's `dapr.yaml` fixes that port at `50101`. The sidecar's API is already serving when it loads the resource, so there is still one app and no start-up race. An `MCPServer` can use `streamableHTTP` instead, but the sidecar connects once when it loads the resource and, unless `ignoreErrors` is set, stops if the server isn't up yet, so the MCP server must be running first.

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
