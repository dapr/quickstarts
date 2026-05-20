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

"""
MCPServer middleware workflows.

Three canonical hook shapes referenced by ``resources/weather-mcp.yaml``:

    rate_limit_workflow   beforeCallTool                 (gate)
    redact_pii_workflow   beforeCallTool, mutate: true   (transform)
    audit_log_workflow    afterCallTool                  (observe)

Hook payloads:
    beforeCallTool: {"name", "toolName", "arguments"}
    afterCallTool : {"name", "toolName", "arguments", "result"}

A `mutate: true` beforeCallTool hook returns the same shape with
modified ``arguments`` — the dapr sidecar uses the returned arguments
when invoking the tool.
"""

import json
import logging
import re
import time
from base64 import b64decode
from typing import Any
import dapr.ext.workflow as wf
from dapr.clients import DaprClient

logger = logging.getLogger("middleware-workflows")

STATE_STORE_NAME = "workflowstatestore"

# ---------------------------------------------------------------------------
# Rate limit (beforeCallTool, gate)
# ---------------------------------------------------------------------------

MAX_CALLS_PER_MINUTE = 10


def rate_limit_workflow(ctx: wf.DaprWorkflowContext, input: dict[str, Any]):
    yield ctx.call_activity(rate_limit_check, input=input)


def rate_limit_check(ctx: wf.WorkflowActivityContext, input: Any) -> None:
    """Increment a per-minute counter; raise if over threshold."""

    if isinstance(input, str):
        input = json.loads(input)

    server = input.get("name", "unknown")
    tool = input.get("toolName", "unknown")
    window = int(time.time()) // 60
    key = f"rate-limit:{server}:{tool}:{window}"

    with DaprClient() as client:
        state = client.get_state(store_name=STATE_STORE_NAME, key=key)
        count = 0
        if state.data and state.data.strip():
            try:
                count = int(state.data.decode().strip('"'))
            except (ValueError, UnicodeDecodeError):
                count = 0

        if count >= MAX_CALLS_PER_MINUTE:
            raise RuntimeError(
                f"Rate limit exceeded: {tool} on {server} "
                f"({count}/{MAX_CALLS_PER_MINUTE} calls this minute)"
            )

        client.save_state(store_name=STATE_STORE_NAME, key=key, value=str(count + 1))
        logger.info(
            "Rate limit OK %s.%s (%d/%d)", server, tool, count + 1, MAX_CALLS_PER_MINUTE
        )


# ---------------------------------------------------------------------------
# Redact PII (beforeCallTool, mutate: true, transform)
# ---------------------------------------------------------------------------

EMAIL_RE = re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b")
PHONE_RE = re.compile(r"\b\d{3}-\d{3}-\d{4}\b")


def _redact(value: Any) -> Any:
    """Recursively redact PII patterns out of strings inside arbitrary structures."""
    if isinstance(value, str):
        value = EMAIL_RE.sub("[REDACTED]", value)
        value = PHONE_RE.sub("[REDACTED]", value)
        return value
    if isinstance(value, dict):
        return {k: _redact(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_redact(v) for v in value]
    return value


def redact_pii_workflow(
    ctx: wf.DaprWorkflowContext, input: dict[str, Any]
) -> Any:
    """Mutating hook: returns the same payload shape with redacted arguments.

    Dapr replaces the tool's incoming arguments with whatever this workflow
    returns. We only touch ``arguments`` — name + toolName flow through unchanged.
    """
    result = yield ctx.call_activity(redact_pii_apply, input=input)
    return result


def redact_pii_apply(ctx: wf.WorkflowActivityContext, input: Any) -> dict[str, Any]:
    if isinstance(input, str):
        input = json.loads(input)
    arguments = input.get("arguments", {}) or {}
    redacted = _redact(arguments)
    if redacted != arguments:
        logger.info(
            "redact_pii applied to %s.%s",
            input.get("name", "unknown"),
            input.get("toolName", "unknown"),
        )
    return {
        "name": input.get("name"),
        "toolName": input.get("toolName"),
        "arguments": redacted,
    }


# ---------------------------------------------------------------------------
# Audit log (afterCallTool, observe)
# ---------------------------------------------------------------------------


def audit_log_workflow(ctx: wf.DaprWorkflowContext, input: dict[str, Any]):
    yield ctx.call_activity(audit_log_write, input=input)


def audit_log_write(ctx: wf.WorkflowActivityContext, input: Any) -> None:
    if isinstance(input, str):
        input = json.loads(input)

    server = input.get("name", "unknown")
    tool = input.get("toolName", "unknown")
    # Nanosecond precision so back-to-back calls don't collide on the state key.
    timestamp_ns = time.time_ns()
    key = f"audit:{server}:{tool}:{timestamp_ns}"

    # `result` is a base64-encoded JSON-encoded MCP CallToolResult on the wire.
    result_payload: Any = input.get("result")
    if isinstance(result_payload, str):
        try:
            result_payload = json.loads(b64decode(result_payload).decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            pass

    record = {
        "name": server,
        "toolName": tool,
        "arguments": input.get("arguments"),
        "result": result_payload,
        "timestamp_ns": timestamp_ns,
    }

    with DaprClient() as client:
        client.save_state(store_name=STATE_STORE_NAME, key=key, value=json.dumps(record))
    logger.info("Audit %s -> %s.%s", key, server, tool)


# ---------------------------------------------------------------------------
# Convenience: register all middleware on a WorkflowRuntime.
# ---------------------------------------------------------------------------


def register_all(runtime: wf.WorkflowRuntime) -> None:
    """Register every middleware workflow + activity defined in this module.

    Call this from each variant's app entry point so the YAML hook references
    in ``resources/weather-mcp.yaml`` resolve.
    """
    runtime.register_workflow(rate_limit_workflow)
    runtime.register_activity(rate_limit_check)
    runtime.register_workflow(redact_pii_workflow)
    runtime.register_activity(redact_pii_apply)
    runtime.register_workflow(audit_log_workflow)
    runtime.register_activity(audit_log_write)
