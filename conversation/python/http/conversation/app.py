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

# Configure logging to only show the message without level/logger prefix
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s'
)

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

logging.info('Conversation input sent: What is dapr?')

# Parse conversation output
data = result.json()
try:
    if 'outputs' in data and len(data['outputs']) > 0:
        out = data['outputs'][0]
        if out.get('model'):
            logging.info('Model: ' + out['model'])
        if out.get('usage'):
            u = out['usage']
            logging.info('Usage: prompt_tokens=%s completion_tokens=%s total_tokens=%s',
                         u.get('promptTokens'), u.get('completionTokens'), u.get('totalTokens'))
        if 'choices' in out and len(out['choices']) > 0:
            output = out["choices"][0]["message"]["content"]
            logging.info('Output response: ' + output)
        else:
            logging.error('No choices in output')
    else:
        logging.error('No outputs found in response')
        logging.error('Response data: ' + str(data))
        
except (KeyError, IndexError) as e:
    logging.error(f'Error parsing response: {e}')
    if 'outputs' in data:
        logging.info(f'Available outputs: {data["outputs"]}')
    else:
        logging.info(f'No outputs found in response')

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
    'response_format': {
        'type': 'object',
        'properties': {
            'answer': {'type': 'string'}
        }
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

logging.info('Tool calling input sent: What is the weather like in San Francisco in celsius?')

# Parse conversation output
data = tool_call_result.json()
if 'outputs' in data and len(data['outputs']) > 0:
    output = data['outputs'][0]
    if output.get('model'):
        logging.info('Model: %s', output['model'])
    if output.get('usage'):
        u = output['usage']
        logging.info('Usage: prompt_tokens=%s completion_tokens=%s total_tokens=%s',
                     u.get('promptTokens'), u.get('completionTokens'), u.get('totalTokens'))
    if 'choices' in output and len(output['choices']) > 0:
        choice = output['choices'][0]
        if 'message' in choice:
            message = choice['message']
            
            if 'content' in message and message['content']:
                logging.info('Output message: ' + message['content'])
            
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