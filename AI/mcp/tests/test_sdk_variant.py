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
"""End-to-end test for the `sdk` variant of the MCP quickstart.

Runs `dapr run -- python python/sdk/app.py` once and asserts on
flow-deterministic markers in the combined stdout+stderr:

- All three MCPServers connected (weather/streamableHTTP, local-tools/stdio,
  notes/SSE)
- Parent workflow reached COMPLETED status
- redact_pii middleware stripped the email PII
- rate_limit middleware tripped on the 11th call

This variant is purely workflow-driven (no LLM), so the marker set is exact.
"""

from __future__ import annotations

import subprocess

import pytest

from .conftest import QUICKSTART_ROOT


@pytest.mark.timeout(240)
def test_sdk_variant_end_to_end(weather_server, notes_server, dapr_check) -> None:
    proc = subprocess.run(
        [
            "dapr",
            "run",
            "--app-id",
            "mcp-sdk",
            "--resources-path",
            "./resources",
            "--",
            "python",
            "python/sdk/app.py",
        ],
        cwd=QUICKSTART_ROOT,
        capture_output=True,
        text=True,
        timeout=180,
    )

    combined = (proc.stdout or "") + (proc.stderr or "")

    # Surface the real failure cause before checking markers — a non-zero
    # `dapr run` exit otherwise gets reported as "missing markers".
    assert proc.returncode == 0, (
        f"`dapr run` exited with returncode={proc.returncode}\n"
        f"--- last 4KB of combined output ---\n{combined[-4000:]}"
    )

    expected_markers = [
        "Connected to MCPServer 'weather'",
        "Connected to MCPServer 'local-tools'",
        "Connected to MCPServer 'notes'",
        "Parent workflow status: COMPLETED",
        "[REDACTED]",
        "Rate limit exceeded",
    ]
    missing = [m for m in expected_markers if m not in combined]
    assert not missing, (
        f"sdk variant missing expected markers: {missing}\n"
        f"--- last 4KB of combined output ---\n{combined[-4000:]}"
    )
