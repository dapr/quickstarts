import time
import random
import logging
import requests
import os

logging.basicConfig(level=logging.INFO)

base_url = os.getenv('BASE_URL', 'http://localhost') + ':' + os.getenv(
                    'DAPR_HTTP_PORT', '3500')
DAPR_STATE_STORE = 'statestore'

while True:
    order = {'orderId': random.randint(1, 1000)}
    state = [{
      'key': "orderId",
      'value': order
    }]
    logging.info('Order requested: ' + str(order))

    # Save state into a state store
    result = requests.post(
        url='%s/v1.0/state/%s' % (base_url, DAPR_STATE_STORE),
        json=state
    )

    # Get state from a state store
    result = requests.get(
        url='%s/v1.0/state/%s/%s' % (base_url, DAPR_STATE_STORE, 'orderId')
    )
    logging.info('Result after get: ' + str(result.json()))
    
    time.sleep(1)
