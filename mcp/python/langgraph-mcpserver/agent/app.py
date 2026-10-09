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
"""A LangGraph agent that reaches the Dapr MCP server through Dapr's MCPServer resource."""

import asyncio
import json
import os
from typing import Any

from dapr.ext.workflow import WorkflowStatus
from dapr.ext.workflow.aio import DaprMCPClient, DaprWorkflowClient, MCPToolDef
from langchain.agents import create_agent
from langchain_core.tools import StructuredTool
from langchain_openai import ChatOpenAI

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


def result_text(result: dict[str, Any]) -> str:
    """Flatten an MCP CallToolResult into the text the LLM reads.

    The Dapr MCP server puts the details, such as component names, in structuredContent.
    """
    parts = [item["text"] for item in result.get("content", []) if item.get("type") == "text"]
    if "structuredContent" in result:
        parts.append(json.dumps(result["structuredContent"]))
    text = "\n".join(parts)
    return f"Error: {text}" if result.get("isError") else text


async def call_tool(wf_client: DaprWorkflowClient, tool: MCPToolDef, arguments: dict[str, Any]) -> str:
    """Call an MCP tool by starting its CallTool workflow on the sidecar and waiting for the result."""
    instance_id = await wf_client.schedule_new_workflow(tool.call_tool_workflow, input={"arguments": arguments})
    try:
        state = await wf_client.wait_for_workflow_completion(instance_id, timeout_in_seconds=TOOL_CALL_TIMEOUT_SECONDS)
    except TimeoutError as err:
        raise RuntimeError(f"{tool.call_tool_workflow} did not finish within {TOOL_CALL_TIMEOUT_SECONDS}s") from err
    if state is None or state.runtime_status != WorkflowStatus.COMPLETED:
        status = state.runtime_status.name if state else "unknown"
        reason = state.failure_details.message if state and state.failure_details else "no failure details"
        raise RuntimeError(f"{tool.call_tool_workflow} ended as {status}: {reason}")
    return result_text(json.loads(state.serialized_output))


def to_langchain_tool(wf_client: DaprWorkflowClient, tool: MCPToolDef) -> StructuredTool:
    """Wrap an MCP tool as a LangChain tool, using the tool's JSON Schema for its arguments."""

    async def run(**arguments: Any) -> str:
        return await call_tool(wf_client, tool, arguments)

    return StructuredTool.from_function(
        coroutine=run,
        name=tool.name,
        description=tool.description,
        # OpenAI expects "properties" even for a tool without arguments, such as get_components.
        args_schema={"properties": {}, **tool.input_schema},
    )


async def main() -> None:
    wf_client = DaprWorkflowClient()

    # Starts the dapr.internal.mcp.dapr.ListTools workflow and keeps the tool definitions.
    mcp_client = DaprMCPClient(wf_client=wf_client)
    await mcp_client.connect(MCP_SERVER_NAME)
    mcp_tools = {tool.name: tool for tool in mcp_client.get_all_tools()}
    tools = [to_langchain_tool(wf_client, tool) for tool in mcp_tools.values()]
    print(f"Loaded {len(tools)} tools from the Dapr MCP server", flush=True)

    # Parallel tool calls could run get_state before save_state has finished.
    model = ChatOpenAI(model=MODEL, model_kwargs={"parallel_tool_calls": False})
    agent = create_agent(model, tools, system_prompt=INSTRUCTIONS)
    result = await agent.ainvoke({"messages": [{"role": "user", "content": TASK}]})
    for message in result["messages"]:
        for call in getattr(message, "tool_calls", None) or []:
            print(f"Tool call: {call['name']} {call['args']}", flush=True)
    print(f"Agent reply: {result['messages'][-1].content}", flush=True)

    # Read the key back without the LLM to confirm the agent really saved it.
    text = await call_tool(wf_client, mcp_tools["get_state"], {"storeName": STATE_STORE, "key": PREFERENCE_KEY})
    if PREFERENCE_VALUE in text:
        print(f"Verified in state store: {PREFERENCE_KEY} = {PREFERENCE_VALUE}", flush=True)
    else:
        print(f"Preference not found in state store: {text}", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
