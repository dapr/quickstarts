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
import requests
import os

base_url = os.getenv('BASE_URL', 'http://localhost') + ':' + os.getenv(
                    'DAPR_HTTP_PORT', '3500')

CONVERSATION_COMPONENT_NAME = 'ollama'

input = {
    'inputs': [{
        'messages': [{
            'ofUser': {
                'content': [{
                    'text': 'What is dapr?'
                }]
            }
        }]
    }],
    'parameters': {},
    'metadata': {},
    'response_format': {
        'type': 'object',
        'properties': {
            'answer': {'type': 'string'}
        },
        'required': ['answer']
    },
    'prompt_cache_retention': '86400s'
}

# Send input to conversation endpoint
result = requests.post(
    url='%s/v1.0-alpha2/conversation/%s/converse' % (base_url, CONVERSATION_COMPONENT_NAME),
    json=input
)

print('Conversation input sent: What is dapr?')

# Parse conversation output
data = result.json()
try:
    if 'outputs' in data and len(data['outputs']) > 0:
        out = data['outputs'][0]
        if out.get('model'):
            print('Model: ' + out['model'])
        if out.get('usage'):
            u = out['usage']
            print(f'Usage: prompt_tokens={u.get("promptTokens")} completion_tokens={u.get("completionTokens")} total_tokens={u.get("totalTokens")}')
        if 'choices' in out and len(out['choices']) > 0:
            output = out["choices"][0]["message"]["content"]
            print('Output response: ' + output)
        else:
            print('No choices in output')
    else:
        print('No outputs found in response')
        print('Response data: ' + str(data))
        
except (KeyError, IndexError) as e:
    print(f'Error parsing response: {e}')
    if 'outputs' in data:
        print(f'Available outputs: {data["outputs"]}')
    else:
        print('No outputs found in response')

tool_call_input = {
    'inputs': [{
        'messages': [{
            'ofUser': {
                'content': [{
                    'text': 'What is the weather like in San Francisco in celsius?'
                }]
            }
        }],
        'scrubPii': False
    }],
    'parameters': {
        'max_tokens': {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            'value': '100'
        },
        'model': {
            '@type': 'type.googleapis.com/google.protobuf.StringValue',
            'value': 'claude-3-5-sonnet-20240620'
        }
    },
    'metadata': {
        'api_key': 'test-key',
        'version': '1.0'
    },
    'prompt_cache_retention': '86400s',
    'scrubPii': False,
    'temperature': 0.7,
    'tools': [{
        'function': {
            'name': 'get_weather',
            'description': 'Get the current weather for a location',
            'parameters': {
                'type': 'object',
                'properties': {
                    'location': {
                        'type': 'string',
                        'description': 'The city and state, e.g. San Francisco, CA'
                    },
                    'unit': {
                        'type': 'string',
                        'enum': ['celsius', 'fahrenheit'],
                        'description': 'The temperature unit to use'
                    }
                },
                'required': ['location']
            }
        }
    }],
    'toolChoice': 'required'
}

# Send input to conversation endpoint
tool_call_result = requests.post(
    url='%s/v1.0-alpha2/conversation/%s/converse' % (base_url, CONVERSATION_COMPONENT_NAME),
    json=tool_call_input
)

print('Tool calling input sent: What is the weather like in San Francisco in celsius?')

# Parse conversation output
data = tool_call_result.json()
if 'outputs' in data and len(data['outputs']) > 0:
    output = data['outputs'][0]
    if output.get('model'):
        print('Model: ' + output['model'])
    if output.get('usage'):
        u = output['usage']
        print(f'Usage: prompt_tokens={u.get("promptTokens")} completion_tokens={u.get("completionTokens")} total_tokens={u.get("totalTokens")}')
    if 'choices' in output and len(output['choices']) > 0:
        choice = output['choices'][0]
        if 'message' in choice:
            message = choice['message']
            
            if 'content' in message and message['content']:
                print('Output message: ' + message['content'])
            
            if 'toolCalls' in message and message['toolCalls']:
                print('Tool calls detected:')
                for tool_call in message['toolCalls']:
                    print('Tool call: ' + str(tool_call))
                    
                    if 'function' in tool_call:
                        func_call = tool_call['function']
                        print(f"Function name: {func_call.get('name', 'unknown')}")
                        print(f"Function arguments: {func_call.get('arguments', 'none')}")
            else:
                print('Tool calls not found')
        else:
            print('No message in choice')
    else:
        print('No choices in output')
else:
    print('No outputs in response')
    print('Response data: ' + str(data))