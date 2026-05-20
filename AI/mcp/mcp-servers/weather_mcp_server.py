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
Weather MCP Server (streamableHTTP transport)
=============================================

Exposes ``get_weather`` and ``get_forecast`` over the streamableHTTP
transport at ``http://<host>:<port>/mcp``.

Run::

    python weather_mcp_server.py [--host 0.0.0.0] [--port 8081]
"""

import argparse
import logging
import random

from mcp.server.fastmcp import FastMCP

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("weather-mcp-server")


def build_server(host: str, port: int) -> FastMCP:
    mcp = FastMCP("WeatherService", host=host, port=port)

    @mcp.tool()
    async def get_weather(location: str) -> str:
        """Get current weather information for a location.

        Args:
            location: City or region name (e.g. 'Seattle', 'London').

        Returns:
            Current temperature and conditions.
        """
        # Logged so users can see exactly what the upstream MCP server received,
        # which matters for the redact_pii_workflow demonstration.
        logger.info("get_weather called with location=%r", location)
        temperature = random.randint(32, 105)
        conditions = random.choice(
            ["sunny", "cloudy", "partly cloudy", "rainy", "windy", "snowy", "foggy"]
        )
        humidity = random.randint(20, 95)
        return f"{location}: {temperature}F, {conditions}, {humidity}% humidity."

    @mcp.tool()
    async def get_forecast(location: str, days: int = 5) -> str:
        """Get a multi-day weather forecast for a location.

        Args:
            location: City or region name.
            days: Number of days to forecast (default 5, max 10).

        Returns:
            Multi-line forecast summary.
        """
        logger.info("get_forecast called with location=%r days=%d", location, days)
        days = min(max(days, 1), 10)
        lines = [f"{location} {days}-day forecast:"]
        for i in range(1, days + 1):
            high = random.randint(55, 105)
            low = high - random.randint(10, 25)
            cond = random.choice(["sunny", "cloudy", "rainy", "stormy", "clear", "partly cloudy"])
            lines.append(f"  Day {i}: High {high}F / Low {low}F, {cond}")
        return "\n".join(lines)

    return mcp


def main() -> None:
    parser = argparse.ArgumentParser(description="Weather MCP server (streamableHTTP transport)")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8081)
    args = parser.parse_args()

    mcp = build_server(args.host, args.port)
    logger.info("Weather MCP server listening on http://%s:%d/mcp", args.host, args.port)
    try:
        mcp.run(transport="streamable-http")
    except (KeyboardInterrupt, SystemExit):
        logger.info("Shutting down.")


if __name__ == "__main__":
    main()
