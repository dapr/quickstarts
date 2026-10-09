# ------------------------------------------------------------
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
# ------------------------------------------------------------
"""A Dapr Agents agent that reaches the Dapr MCP server through Dapr's MCPServer resource."""

import asyncio
import json
import os

from dapr.ext.workflow import WorkflowStatus
from dapr.ext.workflow.aio import DaprWorkflowClient
from dapr_agents import DurableAgent
from dapr_agents.agents.configs import AgentExecutionConfig, ToolExecutionMode
from dapr_agents.llm.openai import OpenAIChatClient
from dapr_agents.workflow.runners import AgentRunner

# metadata.name of the MCPServer resource in ../../../mcpserver-resources.
MCP_SERVER_NAME = "dapr"
TOOL_CALL_TIMEOUT_SECONDS = 60
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

STATE_STORE = "statestore"
PREFERENCE_KEY = "favorite-color"
PREFERENCE_VALUE = "blue"

INSTRUCTIONS = "You are a helpful assistant. Use the Dapr tools to complete the task, one tool call at a time."
TASK = (
    f"Remember that my favorite color is {PREFERENCE_VALUE}. "
    "First call get_components to find the names of the state store and the pub/sub component. "
    f"Save the value '{PREFERENCE_VALUE}' under the exact key '{PREFERENCE_KEY}', "
    "then read that key back to confirm it was stored. "
    "Finally, publish a short message announcing the preference to the 'user-preferences' topic. "
    "Reply with one sentence describing what you did."
)


def reply_text(result: str) -> str:
    """Return the text of the agent's final message, which the runner returns serialized as JSON."""
    try:
        return json.loads(result).get("content", result)
    except (ValueError, AttributeError):
        return result


async def verify_preference() -> None:
    """Read the key back without the LLM, by starting the get_state tool's workflow directly."""
    wf_client = DaprWorkflowClient()
    instance_id = await wf_client.schedule_new_workflow(
        f"dapr.internal.mcp.{MCP_SERVER_NAME}.CallTool.get_state",
        input={"arguments": {"storeName": STATE_STORE, "key": PREFERENCE_KEY}},
    )
    try:
        state = await wf_client.wait_for_workflow_completion(instance_id, timeout_in_seconds=TOOL_CALL_TIMEOUT_SECONDS)
    except TimeoutError:
        print(f"get_state did not finish within {TOOL_CALL_TIMEOUT_SECONDS}s", flush=True)
        return
    if state is None or state.runtime_status != WorkflowStatus.COMPLETED:
        status = state.runtime_status.name if state else "unknown"
        reason = state.failure_details.message if state and state.failure_details else "no failure details"
        print(f"get_state ended as {status}: {reason}", flush=True)
        return
    output = state.serialized_output or ""
    if PREFERENCE_VALUE in output:
        print(f"Verified in state store: {PREFERENCE_KEY} = {PREFERENCE_VALUE}", flush=True)
    else:
        print(f"Preference not found in state store: {output}", flush=True)


async def main() -> None:
    # No tools are passed in: the agent finds the MCPServer resource in the sidecar's metadata,
    # and each tool call runs as a child workflow of the agent's own workflow.
    agent = DurableAgent(
        name="PreferenceAgent",
        role="Preference assistant",
        instructions=[INSTRUCTIONS],
        llm=OpenAIChatClient(model=MODEL),
        # Run the tool calls of one LLM turn one after another, in the order the model made them.
        execution=AgentExecutionConfig(tool_execution_mode=ToolExecutionMode.SEQUENTIAL),
    )

    # AgentRunner would discover the tools on the first run; doing it here lets us report them.
    await agent.connect_mcpservers()
    print(f"Loaded {len(agent.tool_executor.list_tools())} tools from the Dapr MCP server", flush=True)

    runner = AgentRunner()
    try:
        result = await runner.run(agent, payload={"task": TASK})
        if result is None:
            raise RuntimeError("The agent run did not finish")
        print(f"Agent reply: {reply_text(result)}", flush=True)
    finally:
        runner.shutdown(agent)

    await verify_preference()


if __name__ == "__main__":
    asyncio.run(main())
