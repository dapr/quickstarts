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
import logging
import requests
import os

logging.basicConfig(level=logging.INFO)

base_url = os.getenv('BASE_URL', 'http://localhost') + ':' + os.getenv(
                    'DAPR_HTTP_PORT', '3500')

CONVERSATION_COMPONENT_NAME = 'echo'

input = {
    'name': 'echo',
    'inputs': [{
        'messages': [{
            'of_user': {
                'content': [{
                    'text': 'What is the weather like in San Francisco?'
                }]
            }
        }],
        'scrubPII': False
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
    'toolChoice': 'auto'
}

# Send input to conversation endpoint
result = requests.post(
    url='%s/v1.0-alpha2/conversation/%s/converse' % (base_url, CONVERSATION_COMPONENT_NAME),
    json=input
)

logging.info('Input sent: What is the weather like in San Francisco?')

# Parse conversation output
data = result.json()
if 'outputs' in data and len(data['outputs']) > 0:
    output = data['outputs'][0]
    if 'choices' in output and len(output['choices']) > 0:
        choice = output['choices'][0]
        if 'message' in choice:
            message = choice['message']
            
            if 'content' in message and message['content']:
                logging.info('Content: ' + message['content'])
            
            if 'toolCalls' in message and message['toolCalls']:
                logging.info('Tool calls detected:')
                for tool_call in message['toolCalls']:
                    logging.info('Tool call: ' + str(tool_call))
                    
                    if 'function' in tool_call:
                        func_call = tool_call['function']
                        logging.info(f"Function name: {func_call.get('name', 'unknown')}")
                        logging.info(f"Function arguments: {func_call.get('arguments', 'none')}")
            else:
                logging.info('No tool calls in response')
        else:
            logging.error('No message in choice')
    else:
        logging.error('No choices in output')
else:
    logging.error('No outputs in response')
    logging.error('Response data: ' + str(data)) 