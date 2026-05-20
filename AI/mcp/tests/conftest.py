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
"""Shared pytest fixtures for the AI/mcp quickstart tests.

Background MCP server lifecycle is patterned after
dapr-agents/tests/integration/quickstarts/conftest.py — same socket-poll
readiness + process-group teardown, just adapted to plain pytest fixtures
instead of a context-manager class.
"""

from __future__ import annotations

import contextlib
import socket
import subprocess
import sys
from pathlib import Path
from typing import Iterator

import pytest

from ._process_utils import get_kwargs_for_process_group, terminate_process_group
from ._wait_utils import wait_until

# AI/mcp/ — daprd resolves stdio MCP server paths against its CWD, so every
# `dapr run` test must invoke from this directory.
QUICKSTART_ROOT = Path(__file__).resolve().parents[1]


def _port_open(host: str, port: int) -> bool:
    try:
        with socket.create_connection((host, port), timeout=1):
            return True
    except OSError:
        return False


@contextlib.contextmanager
def _mcp_server(script: str, port: int, host: str = "localhost") -> Iterator[subprocess.Popen]:
    proc = subprocess.Popen(
        [sys.executable, str(QUICKSTART_ROOT / "mcp-servers" / script)],
        cwd=QUICKSTART_ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        **get_kwargs_for_process_group(),
    )
    try:
        wait_until(lambda: _port_open(host, port), timeout=20, interval=0.5)
        yield proc
    finally:
        terminate_process_group(proc)
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            terminate_process_group(proc, force=True)
            proc.wait(timeout=5)


@pytest.fixture(scope="session")
def weather_server() -> Iterator[subprocess.Popen]:
    """streamableHTTP MCP server on :8081 — used by both variants."""
    with _mcp_server("weather_mcp_server.py", 8081) as proc:
        yield proc


@pytest.fixture(scope="session")
def notes_server() -> Iterator[subprocess.Popen]:
    """SSE MCP server on :8082 — used by both variants."""
    with _mcp_server("notes_sse_server.py", 8082) as proc:
        yield proc


@pytest.fixture(scope="session")
def dapr_check() -> None:
    """Skip the suite if the Dapr CLI is not on PATH."""
    try:
        out = subprocess.run(["dapr", "--version"], capture_output=True, text=True, timeout=10)
    except FileNotFoundError:
        pytest.skip("dapr CLI not found on PATH")
        return
    if out.returncode != 0:
        pytest.skip(f"dapr --version failed: {out.stderr.strip() or out.stdout.strip()}")


@pytest.fixture(scope="session")
def ollama_check() -> None:
    """Skip if Ollama is not running or the expected model isn't pulled."""
    try:
        out = subprocess.run(["ollama", "list"], capture_output=True, text=True, timeout=10)
    except FileNotFoundError:
        pytest.skip("ollama CLI not found on PATH")
        return
    if out.returncode != 0:
        pytest.skip(f"`ollama list` failed: {out.stderr.strip() or out.stdout.strip()}")
    if "llama3.2" not in out.stdout:
        pytest.skip("llama3.2 model not available — run `ollama pull llama3.2:latest`")
