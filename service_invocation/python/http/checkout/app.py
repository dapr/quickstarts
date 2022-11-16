import json
import time
import logging
import requests
import os

logging.basicConfig(level=logging.INFO)

base_url = os.getenv('BASE_URL', 'http://localhost') + ':' + os.getenv(
                    'DAPR_HTTP_PORT', '3500')
# Adding app id as part of the header
headers = {'dapr-app-id': 'order-processor', 'content-type': 'application/json'}

for i in range(1, 20):
    order = {'orderId': i}

    # Invoking a service
    result = requests.post(
        url='%s/orders' % (base_url),
        data=json.dumps(order),
        headers=headers
    )
    print('Order passed: ' + json.dumps(order))

    time.sleep(1)
