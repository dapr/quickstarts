import logging
import requests
import os

logging.basicConfig(level=logging.INFO)

base_url = os.getenv('BASE_URL', 'http://localhost') + ':' + os.getenv(
                    'DAPR_HTTP_PORT', '3500')

CONVERSATION_NAME = 'echo'

input = {
		'name': 'echo',
		'inputs': [{'message':'What is dapr?'}],
		'parameters': {},
		'metadata': {}
    }

# Send input to conversation endpoint
result = requests.post(
	url='%s/v1.0-alpha1/conversation/%s/converse' % (base_url, CONVERSATION_NAME),
	json=input
)

# Parse conversation output
data = result.json()
output = data["outputs"][0]["result"]

logging.info('Input sent: What is dapr?')

logging.info('Output response: ' + output)