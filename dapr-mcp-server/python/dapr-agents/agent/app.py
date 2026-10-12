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
"""A Dapr Agents agent that remembers a user preference through the Dapr MCP server."""

import asyncio
import os

from dapr_agents import DurableAgent
from dapr_agents.llm.openai import OpenAIChatClient
from dapr_agents.tool.mcp import MCPClient
from dapr_agents.workflow.runners import AgentRunner

MCP_SERVER_NAME = "dapr"
MCP_SERVER_COMMAND = "dapr-mcp-server"
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


def mcp_server_env() -> dict[str, str]:
    """Return the environment for the MCP server process.

    `dapr run` gives this app DAPR_GRPC_PORT and DAPR_HTTP_PORT.
    Passing them on lets the MCP server reach this app's Dapr sidecar.
    """
    env = {key: value for key, value in os.environ.items() if key.startswith("DAPR_")}
    env["DAPR_MCP_SERVER_LOG_LEVEL"] = "warn"
    return env


async def verify_preference(client: MCPClient) -> None:
    """Read the key back without the LLM to confirm the agent really saved it."""
    async with client.create_ephemeral_session(MCP_SERVER_NAME) as session:
        check = await session.call_tool("get_state", {"storeName": STATE_STORE, "key": PREFERENCE_KEY})
    text = " ".join(item.text for item in check.content if item.type == "text")
    if PREFERENCE_VALUE in text:
        print(f"Verified in state store: {PREFERENCE_KEY} = {PREFERENCE_VALUE}", flush=True)
    else:
        print(f"Preference not found in state store: {text}", flush=True)


async def main() -> None:
    # The client lists the tools once, then starts a short-lived
    # dapr-mcp-server process for each tool call the agent makes.
    client = MCPClient()
    await client.connect_stdio(
        server_name=MCP_SERVER_NAME,
        command=MCP_SERVER_COMMAND,
        env=mcp_server_env(),
    )
    tools = client.get_all_tools()
    print(f"Loaded {len(tools)} tools from the Dapr MCP server", flush=True)

    agent = DurableAgent(
        name="PreferenceAgent",
        role="Preference assistant",
        instructions=[INSTRUCTIONS],
        llm=OpenAIChatClient(model=MODEL),
        tools=tools,
    )

    runner = AgentRunner()
    try:
        result = await runner.run(agent, payload={"task": TASK})
        print(f"Agent reply: {result}", flush=True)
    finally:
        runner.shutdown(agent)

    await verify_preference(client)


if __name__ == "__main__":
    asyncio.run(main())
