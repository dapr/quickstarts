# ------------------------------------------------------------
# Copyright 2025 The Dapr Authors
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
from dapr.clients import DaprClient
from dapr.clients.grpc._request import (ConversationInputAlpha2, ConversationMessage, ConversationMessageContent,
                                        ConversationMessageOfUser, ConversationToolsFunction, ConversationTools)

with DaprClient() as d:
    provider_component = "echo"

    function = ConversationToolsFunction(
        name="calculate",
        description="Perform calculations",
        parameters={
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "Math expression"
                }
            },
            "required": ["expression"]
        }
    )
    calc_tool = ConversationTools(function=function)

    textInput = "calculate square root of 15"
    inputs = [
        ConversationInputAlpha2(messages=[ConversationMessage(of_user=ConversationMessageOfUser(content=[ConversationMessageContent(text=textInput)]))],
                                scrub_pii=True),
    ]

    print(f'Input sent: {textInput}')

    response = d.converse_alpha2(
        name=provider_component,
        inputs=inputs,
        temperature=0.7,
        tools=[calc_tool],
    )

    for output in response.outputs:
        print(f'Output response: {output.choices[0]}')
