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
    'inputs': [{
        'messages': [{
            'of_user': {
                'content': [{
                    'text': 'What is dapr?'
                }]
            }
        }]
    }],
    'parameters': {},
    'metadata': {}
}

# Send input to conversation endpoint
result = requests.post(
    url='%s/v1.0-alpha2/conversation/%s/converse' % (base_url, CONVERSATION_COMPONENT_NAME),
    json=input
)

logging.info('Input sent: What is dapr?')

# Parse conversation output
data = result.json()
try:
    if 'outputs' in data and len(data['outputs']) > 0:
        output = data["outputs"][0]["choices"][0]["message"]["content"]
        logging.info('Output response: ' + output)
    else:
        logging.error('No outputs found in response')
        logging.error('Response data: ' + str(data))
        
except (KeyError, IndexError) as e:
    logging.error(f'Error parsing response: {e}')
    if 'outputs' in data:
        logging.info(f'Available outputs: {data["outputs"]}')
    else:
        logging.info(f'No outputs found in response')