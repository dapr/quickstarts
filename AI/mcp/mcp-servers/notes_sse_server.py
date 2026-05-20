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
from starlette.responses import Response
from starlette.routing import Mount, Route

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

    async def handle_sse(request):
        # Newer Starlette versions invoke the Route handler's return value as
        # an ASGI Response. The SSE handshake already sends the response body
        # via `sse.connect_sse`, so we return an empty Response() here to
        # satisfy Starlette without writing another body.
        async with sse.connect_sse(request.scope, request.receive, request._send) as streams:
            await mcp._mcp_server.run(
                streams[0], streams[1], mcp._mcp_server.create_initialization_options()
            )
        return Response()

    starlette_app = Starlette(
        debug=False,
        routes=[
            Route("/sse", endpoint=handle_sse),
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
