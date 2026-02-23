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
from dapr.clients.grpc.conversation import ConversationInputAlpha2, ConversationMessage, ConversationMessageContent, ConversationMessageOfUser

with DaprClient() as d:
    text_input = "What is dapr?"
    provider_component = "ollama"

    inputs = [
        ConversationInputAlpha2(messages=[ConversationMessage(of_user=ConversationMessageOfUser(content=[ConversationMessageContent(text=text_input)]))],
                                scrub_pii=True),
    ]

    print(f'Input sent: {text_input}')

    response = d.converse_alpha2(name=provider_component, inputs=inputs, temperature=0.7, context_id='chat-123')
    
    if not response or not hasattr(response, 'outputs') or not response.outputs:
        raise ValueError(f"Response does not contain 'outputs'. Response: {response}")
    
    for output in response.outputs:
        if not output or not hasattr(output, 'choices') or not output.choices or len(output.choices) == 0:
            raise ValueError(f"Output does not contain 'choices' array. Output: {output}")
        
        choice = output.choices[0]
        if not choice or not hasattr(choice, 'message') or not choice.message:
            raise ValueError(f"Choice does not contain 'message'. Choice: {choice}")
        
        message = choice.message
        content = getattr(message, 'content', None)
        if content is None:
            raise ValueError(f"Message does not contain 'content'. Message: {message}")
        
        print(f'Output response: {content}')
