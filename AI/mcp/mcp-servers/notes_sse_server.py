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
Notes MCP Server (SSE transport)
================================

Exposes simple in-memory note tools over Server-Sent Events at
``http://<host>:<port>/sse``.

Tools:
  - ``add_note``: Append a note to the in-memory list.
  - ``list_notes``: Return all notes (newline-separated).

Run::

    python notes_sse_server.py [--host 0.0.0.0] [--port 8082]
"""

import argparse
import asyncio
import logging
from typing import List

import uvicorn
from mcp.server.fastmcp import FastMCP
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.routing import Mount

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("notes-sse-server")

mcp = FastMCP("NotesService")

_notes: List[str] = []


@mcp.tool()
async def add_note(text: str) -> str:
    """Append a note to the in-memory store.

    Args:
        text: The note content.

    Returns:
        Confirmation with the new note count.
    """
    _notes.append(text)
    return f"Note added. Total notes: {len(_notes)}."


@mcp.tool()
async def list_notes() -> str:
    """Return all notes recorded so far, newline-separated."""
    if not _notes:
        return "No notes yet."
    return "\n".join(f"{i + 1}. {note}" for i, note in enumerate(_notes))


def main(host: str, port: int) -> None:
    sse = SseServerTransport("/messages/")

    # Raw ASGI callable so we receive the official (scope, receive, send) trio
    # without reaching into Starlette's private `request._send`.
    async def sse_endpoint(scope, receive, send) -> None:
        async with sse.connect_sse(scope, receive, send) as streams:
            await mcp._mcp_server.run(
                streams[0], streams[1], mcp._mcp_server.create_initialization_options()
            )

    starlette_app = Starlette(
        debug=False,
        routes=[
            Mount("/sse", app=sse_endpoint),
            Mount("/messages/", app=sse.handle_post_message),
        ],
    )

    async def serve() -> None:
        config = uvicorn.Config(starlette_app, host=host, port=port, log_level="info")
        server = uvicorn.Server(config)
        logger.info("Notes SSE MCP server listening on http://%s:%d/sse", host, port)
        await server.serve()

    try:
        asyncio.run(serve())
    except KeyboardInterrupt:
        logger.info("Shutting down.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Notes MCP server (SSE transport)")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8082)
    args = parser.parse_args()
    main(host=args.host, port=args.port)
