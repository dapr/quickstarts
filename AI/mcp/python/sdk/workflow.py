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
Parent workflow for the sdk variant.

Calls one tool from each of the three MCPServer resources to demonstrate
that the calling code is identical across transports — only the
``call_tool_workflow`` name (taken from the discovered ``MCPToolDef``)
differs per server.
"""

from typing import Any

from dapr.ext.workflow import DaprWorkflowContext


def call_three_tools_workflow(ctx: DaprWorkflowContext, input: dict[str, Any]):
    """Invoke one tool per MCP server, in order, and collect results.

    Input shape::

        {
          "weather":     {"workflow": "<call_tool_workflow>", "arguments": {...}},
          "local_tools": {"workflow": "<call_tool_workflow>", "arguments": {...}},
          "notes":       {"workflow": "<call_tool_workflow>", "arguments": {...}},
        }
    """
    weather_result = yield ctx.call_child_workflow(
        workflow=input["weather"]["workflow"],
        input={"arguments": input["weather"]["arguments"]},
    )
    local_result = yield ctx.call_child_workflow(
        workflow=input["local_tools"]["workflow"],
        input={"arguments": input["local_tools"]["arguments"]},
    )
    notes_result = yield ctx.call_child_workflow(
        workflow=input["notes"]["workflow"],
        input={"arguments": input["notes"]["arguments"]},
    )
    return {
        "weather": weather_result,
        "local_tools": local_result,
        "notes": notes_result,
    }
