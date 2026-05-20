# MCPServer Quickstart — With Dapr Agents

Zero-config: a `DurableAgent` with **no `tools=` argument** automatically discovers MCPServer tools from the Dapr sidecar metadata.

This variant in 30 seconds:

1. Construct a `DurableAgent` — no MCP client code, no tool list, no transport config.
2. Dapr Agents queries the sidecar's metadata API, finds three loaded MCPServers (`weather`, `local-tools`, `notes`), discovers each one's tools, wraps them as workflow tools.
3. The agent picks the right tool from the right server per user request — across all three transports.
4. Middleware on `weather-mcp.yaml` (`rate_limit_workflow`, `redact_pii_workflow`, `audit_log_workflow`) fires automatically because we register those workflows on the same runtime the agent uses.

## Run

Three terminals.

We use [uv](https://docs.astral.sh/uv/) to manage the Python environment. `AI/mcp/` is a uv workspace; one `uv sync` installs every variant's dependencies into `AI/mcp/.venv/` from the checked-in lockfile.

```bash
cd quickstarts/AI/mcp
uv sync
source .venv/bin/activate
```

**Terminal A — streamableHTTP MCP server (port 8081):**

```bash
python mcp-servers/weather_mcp_server.py
```

**Terminal B — SSE MCP server (port 8082):**

```bash
source .venv/bin/activate   # reuse the venv from Terminal A
python mcp-servers/notes_sse_server.py
```

(The stdio MCP server is spawned by daprd when the `local-tools` MCPServer resource loads — no separate terminal.)

**Terminal C — the agent:**

Run from the `AI/mcp` directory so the `local-tools` stdio MCP server (whose YAML uses the relative path `mcp-servers/local_tools_server.py`) resolves against daprd's working directory:

First, make sure [Ollama](https://ollama.com) is running and the model is pulled:

```bash
ollama serve &                    # or run the Ollama desktop app
ollama pull llama3.2:latest
```

Then run the agent:

```bash
source .venv/bin/activate   # reuse the venv from Terminal A
dapr run \
  --app-id mcp-agent \
  --resources-path ./resources \
  -- python python/dapr-agents/agent.py
```

(dapr-agents calls into Dapr's [Conversation API](https://docs.dapr.io/developing-ai/conversation/) rather than the LLM directly. The included [`resources/ollama.yaml`](../../resources/ollama.yaml) declares a `conversation.ollama` component pointing at the local Ollama daemon — no API key required. To use a different provider, replace `ollama.yaml` with another `conversation.*` component — see the [conversation components reference](https://docs.dapr.io/reference/components-reference/supported-conversation/).)

## What just happened

- Dapr loaded three `MCPServer` resources. Their per-tool workflows registered against the in-process workflow engine.
- `AgentBase` queried the sidecar's metadata API at agent init, found the three MCPServer names, and called `DaprMCPClient.connect(...)` for each before the agent's first turn.
- The agent saw a unified tool catalogue — `get_weather`, `get_forecast` (from `weather`); `current_time`, `echo` (from `local-tools`); `add_note`, `list_notes` (from `notes`) — and routed the user task across the right ones.
- For the `weather` calls: the middleware workflows you registered on the shared runtime fired in order (rate limit, redact PII, then the tool, then audit log). For the other two MCPServers, no middleware ran (no hooks configured on those resources).

## Demonstrate the mutating hook

The agent's task includes `"contact me at user@example.com"`. Watch terminal A — the upstream weather server logs:

```
get_weather called with location='Seattle (contact me at [REDACTED])'
```

The email never reaches the upstream MCP server.

## Demonstrate the rate limit

Run the agent several times in quick succession (each run issues at least one `get_weather` call). Once you cross 10 weather tool calls in a minute, `rate_limit_workflow` raises and the call comes back as a structured error. Calls to `local-tools` and `notes` keep working because no rate limit is configured on those MCPServers.

If you want to trip the limit deterministically without rerunning the whole agent, switch to the `sdk` variant — its `app.py` issues 12 weather calls in a tight loop at the end specifically to demonstrate the gate.

## Inspect the audit log

Audit entries land under `audit:<server>:<tool>:<timestamp>` keys in Redis:

```bash
DAPR_PORT=$(dapr list -o json | python -c "import sys,json; d=json.load(sys.stdin); print([a for a in d if a['appId']=='mcp-agent'][0]['httpPort'])")
curl "http://localhost:$DAPR_PORT/v1.0/state/workflowstatestore/audit:weather:get_weather:<timestamp>"
```

Or grep Redis directly:

```bash
redis-cli --scan --pattern 'audit:*'
```

Note: only `weather` calls produce audit entries (the other two MCPServers don't have the `audit_log_workflow` hook configured).
