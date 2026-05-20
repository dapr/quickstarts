# MCPServer Quickstart — Durable MCP tool execution with Dapr

This quickstart shows how to declare MCP (Model Context Protocol) server connections as first-class Dapr resources. When daprd loads an `MCPServer`, it discovers the server's tools and registers a built-in durable workflow per tool — calling a tool becomes "start a workflow" and Dapr handles the connection, retries, credentials, observability, and crash recovery.

The variant in [`python/sdk/`](./python/sdk/) demonstrates the SDK-driven path: explicit `DaprMCPClient` discovery + `call_child_workflow` per tool. Pick this if you want to see exactly what's happening end-to-end, or you're integrating with a framework other than dapr-agents.

> **Looking for the agent-driven path?** See [`dapr-agents/examples/10-mcpserver-all-transports/`](https://github.com/dapr/dapr-agents/tree/main/examples/10-mcpserver-all-transports) for a `DurableAgent` that uses these same MCPServer resources (and the same middleware shapes) via zero-config auto-discovery against the sidecar metadata API.

## What you'll see

- **Three MCP transports** working through the same calling code — only the YAML `spec.endpoint` differs:

  | Resource | Server | Transport | Tools |
  |---|---|---|---|
  | `weather-mcp.yaml` | `weather_mcp_server.py` | `streamableHTTP` (`http://localhost:8081/mcp`) | `get_weather`, `get_forecast` |
  | `local-tools-mcp.yaml` | `local_tools_server.py` | `stdio` (spawned by daprd) | `current_time`, `echo` |
  | `notes-mcp.yaml` | `notes_sse_server.py` | `sse` (`http://localhost:8082/sse`) | `add_note`, `list_notes` |

- **Three middleware shapes** — all configured on `weather-mcp.yaml`. The other two MCPServers stay clean so you can compare with/without behavior side-by-side:

  | Hook | Type | What it does |
  |---|---|---|
  | `rate_limit_workflow` | `beforeCallTool`, observe-and-gate | Per-tool counter in state; rejects beyond `MAX_CALLS_PER_MINUTE = 10` with a structured error. |
  | `redact_pii_workflow` | `beforeCallTool`, **mutating** (`mutate: true`) | Regex-strips email/phone from string args before the tool sees them. |
  | `audit_log_workflow` | `afterCallTool`, observe | Writes `{tool, arguments, result, timestamp}` to the state store. |

  Together they cover the canonical "observe / gate / transform" middleware patterns the [dapr.io MCPServer docs](https://docs.dapr.io/developing-ai/mcp/mcp-server-resource/) describe.

## Architecture

```
                                ┌─────────────────────────┐
                                │   weather_mcp_server    │
                                │   (streamableHTTP :8081)│
                                └──────────▲──────────────┘
                                           │ + middleware:
                                           │   rate_limit
   ┌───────────┐    ┌──────────┐           │   redact_pii (mutate)
   │   app     │───▶│  daprd   │───────────┤   audit_log
   │           │    │          │           │  ┌─────────────────────────┐
   └───────────┘    └──────────┘           ├─▶│  local_tools_server     │
                                           │  │  (stdio subprocess)     │
                                           │  └─────────────────────────┘
                                           │  ┌─────────────────────────┐
                                           └─▶│  notes_sse_server       │
                                              │  (SSE :8082)            │
                                              └─────────────────────────┘
```

## Prerequisites

- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/) installed and `dapr init` completed. Runtime version >= 1.18.
- Python 3.11+
- Docker (used by `dapr init`)

## Automated tests

[`tests/`](./tests/) contains a pytest-based end-to-end test that spawns the three MCP server processes, runs the sdk variant under `dapr run`, and asserts on the workflow output (tool results, PII redaction, rate-limit trip). The quickstart is a [uv workspace](https://docs.astral.sh/uv/concepts/workspaces/) — `mcp-servers/` and `python/sdk/` are members declared in [`pyproject.toml`](./pyproject.toml) and pinned by [`uv.lock`](./uv.lock):

```bash
cd quickstarts/AI/mcp
uv run --group dev pytest -v tests/
```

`uv run` syncs the workspace into `.venv/` from the lockfile on first invocation, then executes pytest inside it. To regenerate the lock after changing any member's `pyproject.toml`, run `uv lock`.

## Quick run

```bash
cd python/sdk && cat README.md
```

## Cleanup

```bash
dapr stop --app-id mcp-sdk
# Then Ctrl-C the long-running MCP servers in their terminals.
# (The stdio MCP server is reaped by daprd automatically.)
```

## Languages

Python only for now. Equivalent variants for the other SDKs will land shortly.

## Next steps

- [MCPServer resource overview](https://docs.dapr.io/developing-ai/mcp/mcp-server-resource/) — full docs page covering deployment topologies (gateway / one-to-one / mixed), `WorkflowAccessPolicy`-based gating, cross-app middleware via `appID`, catalog metadata, and `ignoreErrors` for tolerant loading.
- [How-To: Use MCPServer resources](https://docs.dapr.io/developing-ai/mcp/howto-use-mcpserver/)
- [Workflow API reference](https://docs.dapr.io/reference/api/workflow_api/)
- [`dapr-agents/examples/10-mcpserver-all-transports/`](https://github.com/dapr/dapr-agents/tree/main/examples/10-mcpserver-all-transports) — the agent-driven variant using these same patterns
