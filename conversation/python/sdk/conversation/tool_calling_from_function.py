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

# The automated function to schema converter requires the function with its docstring and arguments typed and a
# brief description of each in the docstring.
def calculate(expression: str) -> str:
    """Perform calculations.

    It allows for the following calculations:
    - Square root of a number.
    - Addition, subtraction, multiplication and division.

    It CANNOT do trigonometry calculations.

    Args:
         expression (str): Math expression.
    """
    return expression

def execute_converse_alpha2(text_input: str, tool: ConversationTools) -> None:

    # disable scrubbing of PII as some numbers can be matched as phone numbers
    inputs = [
        ConversationInputAlpha2(messages=[ConversationMessage(of_user=ConversationMessageOfUser(content=[ConversationMessageContent(text=text_input)]))],
                                scrub_pii=False),
    ]

    print(f'Input sent: {text_input}')

    response = d.converse_alpha2(
        name=provider_component,
        inputs=inputs,
        temperature=0.7,
        tools=[calc_tool],
    )

    for output in response.outputs:
        print(f'Output response: {output.choices[0]}')

with DaprClient() as d:
    provider_component = "echo"  # Change to your provider component name

    # uses the function to schema converter to generate the ConversationToolsFunction automatically, especially the json-schema section
    func = ConversationToolsFunction.from_function(calculate)
    calc_tool = ConversationTools(function=func)

    print(f'Function schema generated: \n  Name: {func.name}\n  Description: {func.description}\n  Parameters (json-schema): {func.parameters}\n')

    print('\n----------\n')

    print('First call to calculator should trigger a tool call on both real and echo providers:')

    execute_converse_alpha2("calculate square root of 15", calc_tool)

    print('\n----------\n')
    print('Second call to calculator should not trigger a tool call on a real provider but on echo provider it will still do the echo as a tool call:')

    execute_converse_alpha2("calculate the sine of 195.33", calc_tool)

