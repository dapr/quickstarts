import time
import requests
import os

base_url = os.getenv('BASE_URL', 'http://localhost') + ':' + os.getenv(
                    'DAPR_HTTP_PORT', '3500')
DAPR_STATE_STORE = 'statestore'

for i in range(1, 100):
    orderId = str(i)
    order = {'orderId': orderId}
    state = [{
      'key': orderId,
      'value': order
    }]

    # Save state into a state store
    result = requests.post(
        url='%s/v1.0/state/%s' % (base_url, DAPR_STATE_STORE),
        json=state
    )
    print(f'Saving Order: {order}')

    # Get state from a state store
    result = requests.get(
        url='%s/v1.0/state/%s/%s' % (base_url, DAPR_STATE_STORE, orderId)
    )
    print(f'Getting Order: {result.json()}')

    # Delete state from the state store
    result = requests.delete(
        url='%s/v1.0/state/%s' % (base_url, DAPR_STATE_STORE),
        json=state
    )
    print(f'Deleted Order: {order}')
    
    time.sleep(1)
