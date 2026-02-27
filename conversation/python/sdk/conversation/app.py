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
import sys
from dapr.clients import DaprClient
from dapr.clients.grpc.conversation import ConversationInputAlpha2, ConversationMessage, ConversationMessageContent, ConversationMessageOfUser

try:
    with DaprClient() as d:
        text_input = "What is dapr?"
        provider_component = "ollama"

        inputs = [
            ConversationInputAlpha2(messages=[ConversationMessage(of_user=ConversationMessageOfUser(content=[ConversationMessageContent(text=text_input)]))],
                                    scrub_pii=True),
        ]

        print(f'Input sent: {text_input}', flush=True)

        response = d.converse_alpha2(name=provider_component, inputs=inputs, temperature=0.7)
        
        if response and hasattr(response, 'outputs') and response.outputs:
            for output in response.outputs:
                if hasattr(output, 'model') and output.model:
                    print(f'Model: {output.model}', flush=True)
                
                if hasattr(output, 'usage') and output.usage:
                    usage = output.usage
                    prompt_tokens = getattr(usage, 'prompt_tokens', None) or getattr(usage, 'promptTokens', None)
                    completion_tokens = getattr(usage, 'completion_tokens', None) or getattr(usage, 'completionTokens', None)
                    total_tokens = getattr(usage, 'total_tokens', None) or getattr(usage, 'totalTokens', None)
                    print(f'Usage: prompt_tokens={prompt_tokens} completion_tokens={completion_tokens} total_tokens={total_tokens}', flush=True)
                
                if output and hasattr(output, 'choices') and output.choices and len(output.choices) > 0:
                    choice = output.choices[0]
                    if choice and hasattr(choice, 'message') and choice.message:
                        message = choice.message
                        content = getattr(message, 'content', None)
                        if content:
                            print(f'Output response: {content}', flush=True)
                        else:
                            print(f'Output response: {message}', flush=True)
                    else:
                        print(f'Output response: {choice}', flush=True)
                else:
                    print('No choices in output', flush=True)
                    print(f'Output response: {output}', flush=True)
        else:
            print('No outputs found in response', flush=True)
            print(f'Response data: {response}', flush=True)
except Exception as e:
    print(f'Error: {e}', file=sys.stderr, flush=True)
    sys.exit(1)
