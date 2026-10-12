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
"""An OpenAI Agents SDK agent that remembers a user preference through the Dapr MCP server."""

import asyncio
import os

from agents import Agent, ModelSettings, Runner
from agents.mcp import MCPServerStdio

MCP_SERVER_NAME = "dapr"
MCP_SERVER_COMMAND = "dapr-mcp-server"
MCP_SESSION_TIMEOUT_SECONDS = 30
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


async def main() -> None:
    # The context manager starts one dapr-mcp-server process and stops it on exit.
    async with MCPServerStdio(
        name=MCP_SERVER_NAME,
        params={"command": MCP_SERVER_COMMAND, "args": [], "env": mcp_server_env()},
        client_session_timeout_seconds=MCP_SESSION_TIMEOUT_SECONDS,
    ) as server:
        tools = await server.list_tools()
        print(f"Loaded {len(tools)} tools from the Dapr MCP server", flush=True)

        # Parallel tool calls could run get_state before save_state has finished.
        agent = Agent(
            name="PreferenceAgent",
            instructions=INSTRUCTIONS,
            model=MODEL,
            model_settings=ModelSettings(parallel_tool_calls=False),
            mcp_servers=[server],
        )
        result = await Runner.run(agent, TASK)
        print(f"Agent reply: {result.final_output}", flush=True)

        # Read the key back without the LLM to confirm the agent really saved it.
        check = await server.call_tool("get_state", {"storeName": STATE_STORE, "key": PREFERENCE_KEY})
        text = " ".join(item.text for item in check.content if item.type == "text")
        if PREFERENCE_VALUE in text:
            print(f"Verified in state store: {PREFERENCE_KEY} = {PREFERENCE_VALUE}", flush=True)
        else:
            print(f"Preference not found in state store: {text}", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
