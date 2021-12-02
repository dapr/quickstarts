import random
from time import sleep    
import requests
import logging
import json
from dapr.clients import DaprClient

logging.basicConfig(level = logging.INFO)
    

while True:
    sleep(random.randrange(50, 5000) / 1000)
    orderId = random.randint(1, 1000)
    PUBSUB_NAME = 'order_pub_sub'
    TOPIC_NAME = 'orders'
    with DaprClient() as client:
        result = client.publish_event(
            pubsub_name=PUBSUB_NAME,
            topic_name=TOPIC_NAME,
            data=json.dumps(orderId),
            data_content_type='application/json',
        )
    logging.info('Published data: ' + str(orderId))
    

