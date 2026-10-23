import json
import time
import random
import requests
import os

base_url = os.getenv('BASE_URL', 'http://localhost') + ':' + os.getenv(
                    'DAPR_HTTP_PORT', '3500')
PUBSUB_NAME = 'orderpubsub'
TOPIC = 'orders'
print(f'Publishing to baseURL: {base_url}, Pubsub Name: {PUBSUB_NAME}, Topic: {TOPIC}')

for i in range(1, 10):
    order = {'orderId': i}

    # Publish an event/message using Dapr PubSub via HTTP Post
    result = requests.post(
        url='%s/v1.0/publish/%s/%s' % (base_url, PUBSUB_NAME, TOPIC),
        json=order
    )
    print('Published data: ' + json.dumps(order))

    time.sleep(1)
