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
from dapr.clients.grpc import conversation

with DaprClient() as d:
    provider_component = "echo"

    # ------------------------------------------------------------
    # Creating Tool Function definition using lower level API and hand-crafted JSON schema
    # ------------------------------------------------------------

    # This is how to register a tool using hand-crafted JSON schema
    function = conversation.ConversationToolsFunction(
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
    calc_tool = conversation.ConversationTools(function=function)

    textInput = "calculate square root of 15"
    inputs = [
        conversation.ConversationInputAlpha2(messages=[
            conversation.ConversationMessage(of_user=conversation.ConversationMessageOfUser(
                content=[conversation.ConversationMessageContent(text=textInput)]))],
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

    # ------------------------------------------------------------
    # Using higher level API helpers
    # ------------------------------------------------------------

    # using @tool decorator helper for tool registration.  The tools will be automatically registered in the SDK and
    # will also be parsed to extract a json-schema representing the function signature so the LLM can understand how to use the tool.
    @conversation.tool
    def get_weather(location: str, unit: str) -> str:
        """get weather from a location in the given unit"""
        return f"The weather in {location} is 25 degrees {unit}."

    textInput = "get weather in San Francisco in celsius"
    # use create helper function (i.e.: create_user_message, create_system_message, etc...) to create inputs easily
    inputs = [
        conversation.ConversationInputAlpha2(messages=[conversation.create_user_message(textInput)], scrub_pii=True),
    ]

    print(f'Input sent: {textInput}')

    response = d.converse_alpha2(
        name=provider_component,
        inputs=inputs,
        temperature=0.7,
        # use get_registered_tools helper function to get all registered tools
        tools=conversation.get_registered_tools(),
    )

    for output in response.outputs:
        print(f'Output response: {output.choices[0]}')

        # registered tools are also automatically set to be invoked easily when called by the LLM
        # using the method conversation.execute_registered_tool:
        # >>> print(conversation.execute_registered_tool(name="get_weather", params={"location":"San Francisco", "unit":"celsius"}))

