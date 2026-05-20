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
Local Tools MCP Server (stdio transport)
========================================

A lightweight MCP server that the Dapr sidecar spawns as a subprocess and
talks to over stdin/stdout.  Referenced by ``resources/local-tools-mcp.yaml``.

Tools:
  - ``current_time``: Returns an ISO-8601 timestamp.
  - ``echo``: Returns the input text unchanged.
"""

import datetime
import logging
import os

from mcp.server.fastmcp import FastMCP

logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("local-tools-server")

mcp = FastMCP("LocalTools")


@mcp.tool()
async def current_time() -> str:
    """Return the current UTC time in ISO-8601 format."""
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


@mcp.tool()
async def echo(text: str) -> str:
    """Return the input text unchanged.

    Args:
        text: Any string to echo back.
    """
    return text


if __name__ == "__main__":
    mcp.run("stdio")
