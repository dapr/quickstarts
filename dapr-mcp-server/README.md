# Dapr MCP server quickstarts

The [Dapr MCP server](https://github.com/dapr/dapr-mcp-server) is a [Model Context Protocol](https://modelcontextprotocol.io/) server that sits in front of a Dapr sidecar and hands AI agents Dapr's building blocks as tools: state, pub/sub, secrets, service invocation, actors, bindings, locks, cryptography and conversation. It only registers the tools for the components the sidecar has loaded, so an agent sees exactly what the application can use.

These quickstarts run the same scenario in three agent frameworks, so you can compare them side by side. Each agent is asked to remember a user preference: it calls `get_components` to discover the component names, saves the preference with `save_state`, reads it back with `get_state` and announces it with `publish_event`.

## The Dapr MCP server and the `MCPServer` resource

Two parts of Dapr have similar names, and these quickstarts use both:

- The **Dapr MCP server** is a standalone program, `dapr-mcp-server`. It is an MCP server, and its tools are Dapr APIs. Every quickstart here runs it. See the [Dapr MCP server documentation](https://docs.dapr.io/developing-ai/mcp/dapr-mcp-server/).
- The **`MCPServer` resource** is a Dapr resource that tells a sidecar to connect to an MCP server, any MCP server, and run each of its tools as a Dapr workflow. Only the `-mcpserver-resource` quickstarts use it, and they point it at the Dapr MCP server. See the [`MCPServer` resource documentation](https://docs.dapr.io/developing-ai/mcp/mcp-server-resource/).

So each framework has two quickstarts, which differ only in how the agent reaches the same Dapr MCP server:

| Framework | [Through an MCP client in the app](#through-an-mcp-client-in-the-app) | [Through the `MCPServer` resource](#through-the-mcpserver-resource) |
|:--|:--|:--|
| [LangGraph](https://langchain-ai.github.io/langgraph/) | [python/langgraph](./python/langgraph), with `langchain-mcp-adapters` | [python/langgraph-mcpserver-resource](./python/langgraph-mcpserver-resource), with a short adapter over `DaprMCPClient` |
| [Dapr Agents](https://docs.dapr.io/developing-ai/dapr-agents/) | [python/dapr-agents](./python/dapr-agents), with `dapr_agents.tool.mcp.MCPClient` | [python/dapr-agents-mcpserver-resource](./python/dapr-agents-mcpserver-resource), built in: `DurableAgent` finds the resource itself |
| [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) | [python/openai-agents](./python/openai-agents), with `agents.mcp.MCPServerStdio` | [python/openai-agents-mcpserver-resource](./python/openai-agents-mcpserver-resource), with a short adapter over `DaprMCPClient` |

Start with the MCP client path unless you want what the workflows add. All six quickstarts load the Dapr components in [`components`](./components): a Redis state store, Redis pub/sub and a local file secret store with one dummy secret. With those loaded, the Dapr MCP server exposes 11 tools.

## Install the Dapr MCP server

The quickstarts expect the `dapr-mcp-server` binary on your `PATH`. Install it with Go 1.26.6 or later:

```bash
go install github.com/dapr/dapr-mcp-server/cmd/dapr-mcp-server@latest
export PATH="$PATH:$(go env GOPATH)/bin"
```

To install a release binary or use the container image instead, see [Getting started with the Dapr MCP server](https://docs.dapr.io/developing-ai/mcp/dapr-mcp-server/dapr-mcp-server-getting-started/).

The agents call an OpenAI model, so set `OPENAI_API_KEY` before running them.

## Through an MCP client in the app

The app runs an MCP client, as it would for any MCP server, and starts `dapr-mcp-server` itself. Nothing changes for an existing agent, and it works with any framework and any Dapr version.

The Dapr MCP server speaks MCP over **stdio** by default, or over **streamable HTTP** when started with `--http <addr>`. These quickstarts use stdio: each agent runs under `dapr run` and starts `dapr-mcp-server` as a child process, passing on its sidecar's `DAPR_GRPC_PORT` so the server talks to the same sidecar. There is one app per quickstart, no port to pick and no start-up race between the agent and the server.

Streamable HTTP suits a server shared by several agents, or one that runs remotely. Run the server as its own Dapr app. Start it from one of the `agent` folders, because the secret store finds its file relative to the directory the sidecar starts in:

```bash
cd python/langgraph/agent
dapr run --app-id dapr-mcp-server --resources-path ../../../components -- dapr-mcp-server --http :8080
```

Then connect any MCP client to `http://localhost:8080/`. Each quickstart's README shows the one-line change to its client. Health probes are served on `/livez`, `/readyz` and `/startupz`. See the [configuration reference](https://docs.dapr.io/developing-ai/mcp/dapr-mcp-server/dapr-mcp-server-configuration/) for every flag, and [authentication](https://docs.dapr.io/developing-ai/mcp/dapr-mcp-server/dapr-mcp-server-authentication/) before you serve beyond localhost.

## Through the `MCPServer` resource

The app has no MCP client. Its sidecar loads the `MCPServer` resource in [`resources/mcpserver.yaml`](./resources/mcpserver.yaml), which is scoped to these quickstarts' app IDs. The sidecar starts `dapr-mcp-server` as its own child process over stdio, registers a Dapr workflow per tool, and the app calls a tool by starting that workflow. Each tool call is then a durable workflow, with Dapr's retries, per-tool tracing and access policies, and optional middleware hooks for audit or redaction. It needs Dapr 1.18 or later. See [How-To: Use MCPServer resources](https://docs.dapr.io/developing-ai/mcp/howto-use-mcpserver/) for a step-by-step guide.

The resource sets `DAPR_GRPC_PORT` so the Dapr MCP server calls back into the same sidecar, and each quickstart's `dapr.yaml` fixes that port at `50101`. Run only one `MCPServer` quickstart at a time, because they share that port. The MCP client quickstarts use random ports and can run alongside one. The sidecar's API is already serving when it loads the resource, so there is still one app and no start-up race. An `MCPServer` can use `streamableHTTP` instead, but the sidecar connects once when it loads the resource and, unless `ignoreErrors` is set, stops if the server isn't up yet, so the Dapr MCP server must be running first.

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

## Learn more

- Dapr MCP server: [overview](https://docs.dapr.io/developing-ai/mcp/dapr-mcp-server/), [getting started](https://docs.dapr.io/developing-ai/mcp/dapr-mcp-server/dapr-mcp-server-getting-started/), [tool reference](https://docs.dapr.io/developing-ai/mcp/dapr-mcp-server/dapr-mcp-server-tool-reference/) and [configuration](https://docs.dapr.io/developing-ai/mcp/dapr-mcp-server/dapr-mcp-server-configuration/)
- `MCPServer` resource: [overview](https://docs.dapr.io/developing-ai/mcp/mcp-server-resource/) and [How-To: Use MCPServer resources](https://docs.dapr.io/developing-ai/mcp/howto-use-mcpserver/)
- [MCP with Dapr](https://docs.dapr.io/developing-ai/mcp/), for every way Dapr and MCP fit together

## About CI

The agents need an OpenAI API key and the `dapr-mcp-server` binary, and the LLM's replies are not deterministic, so the repository's CI does not run these quickstarts. Each README is still written as a [mechanical-markdown](https://github.com/dapr/mechanical-markdown) script: with Dapr initialized, the binary installed and `OPENAI_API_KEY` set, run `make validate` in a quickstart folder to execute it. The checked output avoids the LLM's wording: each app confirms the saved preference with its own `get_state` call.
