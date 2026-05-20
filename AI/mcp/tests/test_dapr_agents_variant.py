# -*- coding: utf-8 -*-
# Copyright 2026 The Dapr Authors
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""End-to-end test for the `dapr-agents` variant of the MCP quickstart.

Runs `dapr run -- python python/dapr-agents/agent.py` once and asserts on
flow-deterministic markers — not on LLM prose, which varies per run.

The LLM (Ollama llama3.2) decides which tools to call. The assertions cover
the parts that are independent of the LLM's exact wording AND aren't gated
on the LLM's argument-shaping behavior:

- Tools were registered against the agent runtime (auto-discovery worked)
- audit_log middleware wrote at least one weather audit entry
- The agent printed the explicit DONE sentinel from agent.py

Markers intentionally NOT asserted here:

- ``[REDACTED]``: ``redact_pii_workflow`` only fires when the LLM passes PII
  through as a tool argument. llama3.2 typically extracts just ``"Seattle"``
  from the prompt's parenthetical email — good security behavior, but
  removes the redaction code-path. The redaction flow is fully covered by
  ``test_sdk_variant`` which sends PII deterministically.
- ``Note added. Total notes:``: that string is printed by
  ``notes_sse_server.py`` to its own stdout (a separate subprocess piped to
  DEVNULL in the fixture). The agent process's stdout — what this test
  captures — never sees it. ``test_sdk_variant`` does observe it via the
  parent workflow's structured output.
"""

from __future__ import annotations

import subprocess

import pytest

from .conftest import QUICKSTART_ROOT


@pytest.mark.timeout(360)
def test_dapr_agents_variant_end_to_end(
    weather_server, notes_server, dapr_check, ollama_check
) -> None:
    proc = subprocess.run(
        [
            "dapr",
            "run",
            "--app-id",
            "mcp-agent",
            "--resources-path",
            "./resources",
            "--",
            "python",
            "python/dapr-agents/agent.py",
        ],
        cwd=QUICKSTART_ROOT,
        capture_output=True,
        text=True,
        timeout=300,
    )

    combined = (proc.stdout or "") + (proc.stderr or "")
    missing: list[str] = []
    expected_markers = [
        "Tool registered: get_weather",  # MCPServer auto-discovery wired the weather tools
        "Tool registered: add_note",  # …and the notes tools
        "Audit audit:weather:",  # audit_log_workflow keyspace — proves middleware fired
        "DONE: agent variant complete",  # explicit sentinel from agent.py
    ]
    for marker in expected_markers:
        if marker not in combined:
            missing.append(marker)

    assert not missing, (
        f"dapr-agents variant missing expected markers: {missing}\n"
        f"--- last 4KB of combined output ---\n{combined[-4000:]}"
    )
