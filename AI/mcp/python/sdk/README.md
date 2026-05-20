# MCPServer Quickstart — With SDK Client 

Discover MCPServer tools using the framework-agnostic `DaprMCPClient`, then invoke them from a Dapr workflow.

This variant in 30 seconds:

1. `DaprMCPClient.connect(...)` against three MCPServers — `weather` (streamableHTTP), `local-tools` (stdio), `notes` (SSE).
2. Use the `MCPToolDef.call_tool_workflow` name (auto-computed by Dapr) to schedule a child workflow per tool.
3. The middleware hooks on `weather-mcp.yaml` (`rate_limit_workflow`, `redact_pii_workflow`, `audit_log_workflow`) fire automatically — no extra wiring in your code.

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

**Terminal C — the app:**

Run from the `AI/mcp` directory so the `local-tools` stdio MCP server (whose YAML uses the relative path `mcp-servers/local_tools_server.py`) resolves against daprd's working directory:

```bash
source .venv/bin/activate   # reuse the venv from Terminal A
dapr run \
  --app-id mcp-sdk \
  --resources-path ./resources \
  -- python python/sdk/app.py
```

## What just happened

- Dapr loaded three `MCPServer` resources from `../../resources/`. Each registered its own per-tool workflows: `dapr.internal.mcp.weather.CallTool.<tool>`, `dapr.internal.mcp.local-tools.CallTool.<tool>`, `dapr.internal.mcp.notes.CallTool.<tool>`.
- `DaprMCPClient.connect("weather"|"local-tools"|"notes")` returned cached tool catalogues with no upstream `tools/list` round-trip — those were eagerly fetched at MCPServer load time.
- The parent workflow scheduled three child workflows by their `call_tool_workflow` names. The calling code is identical across transports — the `MCPToolDef` carries the right workflow name for each.
- For the `weather` calls: `rate_limit_workflow` ran first (gate), then `redact_pii_workflow` mutated the arguments, the tool ran on the upstream MCP server, then `audit_log_workflow` recorded the call. For `local-tools` and `notes` calls, no middleware fired (no hooks configured on those MCPServers).

## Demonstrate the mutating hook

The app passes `"location": "Seattle (contact me at user@example.com)"` to `get_weather`. Watch terminal A — the upstream weather server logs:

```
get_weather called with location='Seattle (contact me at [REDACTED])'
```

The email never reaches the upstream tool; the audit log records the post-redaction value too.

## Demonstrate the rate limit

The app intentionally schedules 12 weather calls in a row at the end. With `MAX_CALLS_PER_MINUTE = 10`, the 11th and 12th fail with a structured `RuntimeError("Rate limit exceeded: ...")`. The app prints the failure_details for the tripped call. The other two MCPServers (`local-tools`, `notes`) have no rate limit and continue to work.

## Inspect the audit log

Audit entries are stored under `audit:<server>:<tool>:<timestamp>` keys in Redis. Read them with the Dapr state HTTP API:

```bash
# Find your dapr port from the terminal where you ran dapr run.
DAPR_PORT=$(dapr list -o json | python -c "import sys,json; d=json.load(sys.stdin); print([a for a in d if a['appId']=='mcp-sdk'][0]['httpPort'])")

# List one of the audit entries (adjust timestamp / server name to match your run).
curl "http://localhost:$DAPR_PORT/v1.0/state/workflowstatestore/audit:weather:get_weather:1747000000"
```

Or grep Redis directly:

```bash
redis-cli --scan --pattern 'audit:*'
```
