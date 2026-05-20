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

import logging
import os
import sys
import time
from dapr.ext.workflow import DaprMCPClient, DaprWorkflowClient, WorkflowRuntime

# Make `from shared.middleware_workflows import ...` resolvable when running
# from this directory (sibling python/shared/ package).
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from shared.middleware_workflows import register_all  # noqa: E402
from workflow import call_three_tools_workflow  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("mcp-sdk")


def discover_tools(client: DaprMCPClient, servers: list[str]) -> dict[str, dict]:
    """Connect to each server and return {server_name: {tool_name: MCPToolDef}}."""
    catalog: dict[str, dict] = {}
    for name in servers:
        client.connect(name)
        tools_for_server = client.get_server_tools(name)
        catalog[name] = {tool.name: tool for tool in tools_for_server}
        logger.info(
            "Connected to MCPServer '%s' — %d tool(s): %s",
            name,
            len(tools_for_server),
            [t.name for t in tools_for_server],
        )
    return catalog


def main() -> None:
    # ---------------------------------------------------------------
    # 1. Set up the workflow runtime: middleware hooks + parent workflow.
    # ---------------------------------------------------------------
    runtime = WorkflowRuntime()
    register_all(runtime)
    runtime.register_workflow(call_three_tools_workflow)
    runtime.start()
    logger.info("WorkflowRuntime started (middleware + parent workflow registered).")

    try:
        # ---------------------------------------------------------------
        # 2. Discover tools from all three MCPServers.
        # ---------------------------------------------------------------
        client = DaprMCPClient(timeout_in_seconds=30)
        catalog = discover_tools(client, ["weather", "local-tools", "notes"])

        # ---------------------------------------------------------------
        # 3. Invoke one tool per server through a parent workflow.
        # ---------------------------------------------------------------
        weather_tool = catalog["weather"]["get_weather"]
        echo_tool = catalog["local-tools"]["echo"]
        add_note_tool = catalog["notes"]["add_note"]

        # Argument deliberately includes PII — the redact_pii_workflow on
        # weather-mcp.yaml will scrub it before the upstream MCP server is
        # called. Watch the weather_mcp_server.py log to see the redacted
        # value land there.
        wf_input = {
            "weather": {
                "workflow": weather_tool.call_tool_workflow,
                "arguments": {"location": "Seattle (contact me at user@example.com)"},
            },
            "local_tools": {
                "workflow": echo_tool.call_tool_workflow,
                "arguments": {"text": "Hello from the stdio MCP server."},
            },
            "notes": {
                "workflow": add_note_tool.call_tool_workflow,
                "arguments": {"text": "Quickstart ran at " + time.strftime("%H:%M:%S")},
            },
        }

        wf_client = DaprWorkflowClient()
        instance_id = wf_client.schedule_new_workflow(
            workflow=call_three_tools_workflow, input=wf_input
        )
        logger.info("Parent workflow scheduled: %s", instance_id)

        state = wf_client.wait_for_workflow_completion(
            instance_id=instance_id, timeout_in_seconds=60, fetch_payloads=True
        )

        if state is None:
            logger.error("Parent workflow timed out.")
            return

        logger.info("Parent workflow status: %s", state.runtime_status.name)
        logger.info("Parent workflow output: %s", state.serialized_output)

        # ---------------------------------------------------------------
        # 4. Demonstrate the rate-limit gate.
        #    MAX_CALLS_PER_MINUTE = 10 in middleware_workflows.py.
        #    Issue a few extra weather calls to trip it.
        # ---------------------------------------------------------------
        logger.info("Demonstrating rate limit on '%s'...", weather_tool.name)
        for i in range(12):
            iid = wf_client.schedule_new_workflow(
                workflow=weather_tool.call_tool_workflow,
                input={"arguments": {"location": "Tokyo"}},
            )
            s = wf_client.wait_for_workflow_completion(
                instance_id=iid, timeout_in_seconds=10, fetch_payloads=True
            )
            status = s.runtime_status.name if s else "TIMEOUT"
            logger.info("  call %2d: %s", i + 1, status)
            if s and s.runtime_status.name == "FAILED":
                logger.info("    rate limit tripped — failure_details=%s", s.failure_details)
                break

    finally:
        runtime.shutdown()
        logger.info("Done.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Interrupted by user — exiting.")
