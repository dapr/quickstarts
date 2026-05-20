# MCPServer Quickstart — Durable MCP tool execution with Dapr

This quickstart shows how to declare MCP (Model Context Protocol) server connections as first-class Dapr resources. When daprd loads an `MCPServer`, it discovers the server's tools and registers a built-in durable workflow per tool — calling a tool becomes "start a workflow" and Dapr handles the connection, retries, credentials, observability, and crash recovery.

Two **equal-weight** integration paths are shown side-by-side, sharing the same MCPServer resources, the same MCP server processes, and the same middleware workflows:

| Variant | When to use |
|---|---|
| [`python/sdk/`](./python/sdk/) | Explicit control via `DaprMCPClient`. Pick this if you're using a non-dapr-agents framework or want to see exactly what's happening. |
| [`python/dapr-agents/`](./python/dapr-agents/) | Zero-config via `DurableAgent` auto-discovery. Pick this if you're already using dapr-agents and want the framework to do all the wiring. |

Only the *calling* code differs between the two — same resources, same MCP servers, same middleware.

## What you'll see across both variants

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
   │   app /   │───▶│  daprd   │───────────┤   audit_log
   │  agent    │    │          │           │  ┌─────────────────────────┐
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
- For the `dapr-agents` variant: a local [Ollama](https://ollama.com) install with the `llama3.2:latest` model pulled (`ollama serve` + `ollama pull llama3.2:latest`). The agent calls Dapr's Conversation API via [`resources/ollama.yaml`](./resources/ollama.yaml) (`conversation.ollama` component) — no API key required. Dapr Agents version >= v1.0.4.

## Automated tests

[`tests/`](./tests/) contains pytest-based end-to-end tests for both variants. The quickstart is a [uv workspace](https://docs.astral.sh/uv/concepts/workspaces/) — `mcp-servers/`, `python/sdk/`, and `python/dapr-agents/` are members declared in [`pyproject.toml`](./pyproject.toml) and pinned by [`uv.lock`](./uv.lock). CI runs these against an Ollama-backed Conversation API; locally:

```bash
cd quickstarts/AI/mcp
uv run --group dev pytest -v tests/
```

`uv run` syncs the workspace into `.venv/` from the lockfile on first invocation, then executes pytest inside it. To regenerate the lock after changing any member's `pyproject.toml`, run `uv lock`.

## Quick run

Pick a variant and follow its README:

```bash
# Variant 1
cd python/sdk && cat README.md

# Variant 2
cd python/dapr-agents && cat README.md
```

## Cleanup

```bash
dapr stop --app-id mcp-sdk     # or mcp-agent
# Then Ctrl-C the long-running MCP servers in their terminals.
# (The stdio MCP server is reaped by daprd automatically.)
```

## Languages

Python only for now. Equivalent variants for the other SDKs will land shortly.

## Next steps

- [MCPServer resource overview](https://docs.dapr.io/developing-ai/mcp/mcp-server-resource/) — full docs page covering deployment topologies (gateway / one-to-one / mixed), `WorkflowAccessPolicy`-based gating, cross-app middleware via `appID`, catalog metadata, and `ignoreErrors` for tolerant loading.
- [How-To: Use MCPServer resources](https://docs.dapr.io/developing-ai/mcp/howto-use-mcpserver/)
- [Workflow API reference](https://docs.dapr.io/reference/api/workflow_api/)
