#from dapr.clients import DaprClient
import json
import time
import random
import logging
import requests
import os

logging.basicConfig(level=logging.INFO)

baseURL = os.getenv('BASE_URL', 'http://localhost') + ':' + os.getenv(
                    'DAPR_HTTP_PORT', '3500')
PUBSUB_NAME = 'order_pub_sub'
ORDERS = 'orders'
logging.info('Publishing to baseURL: %s, Pubsub Name: %s, Topic: %s' % (
            baseURL, PUBSUB_NAME, ORDERS))

while True:
    order = {'orderid': random.randint(1, 1000)}
    data = json.dumps(order)

    result = requests.post('%s/v1.0/publish/%s/%s' % (
                           baseURL, PUBSUB_NAME, ORDERS), data)
    logging.info('Published data: ' + data)

    time.sleep(1)
