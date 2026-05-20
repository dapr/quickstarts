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

import asyncio
import logging
import os
import sys
import dapr.ext.workflow as wf
from dapr_agents import AgentRunner, DurableAgent

# Make `from shared.middleware_workflows import ...` resolvable.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from shared.middleware_workflows import register_all  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("dapr-agents-variant")


async def main() -> None:
    # ------------------------------------------------------------------
    # Single shared WorkflowRuntime for middleware + the agent.
    # The Dapr sidecar accepts only one gRPC worker stream,
    # so middleware and agent must live on the same runtime.
    # ------------------------------------------------------------------
    runtime = wf.WorkflowRuntime()
    register_all(runtime)
    logger.info("Middleware workflows registered on shared WorkflowRuntime.")

    # ------------------------------------------------------------------
    # No tools= argument. dapr-agents discovers all 3 MCPServers from the sidecar metadata API,
    # and wires their tools as workflow tools before the agent's first turn.
    # ------------------------------------------------------------------
    agent = DurableAgent(
        name="MCPQuickstartAgent",
        role="Multi-tool assistant",
        goal=(
            "Answer the user using the right tool from one of the connected "
            "MCP servers (weather, local-tools, notes)."
        ),
        instructions=[
            "Use get_weather / get_forecast for weather questions.",
            "Use echo or current_time for simple utility tasks.",
            "Use add_note / list_notes to record or recall notes.",
            "Always say which MCP server's tool you used.",
        ],
        runtime=runtime,
    )

    # ------------------------------------------------------------------
    # Single user task that should reach more than one MCP server.
    # The 'contact me at...' string is intentional.
    # The redact_pii middleware will strip it before the weather MCP server sees the arguments.
    # ------------------------------------------------------------------
    try:
        async with AgentRunner() as agent_runner:
            await agent_runner.run(
                agent,
                payload={
                    "task": (
                        "Get the weather for Seattle (contact me at user@example.com), "
                        "then add a note recording the forecast."
                    )
                },
                wait=True,
            )
    finally:
        runtime.shutdown()
        logger.info("Done.")
        # Stable sentinel for the pytest harness — not dependent on LLM prose.
        print("DONE: agent variant complete")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Interrupted by user — exiting.")
