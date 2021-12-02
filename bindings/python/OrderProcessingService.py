import random
from time import sleep    
import requests
import logging
import json
from dapr.clients import DaprClient

logging.basicConfig(level = logging.INFO)

BINDING_NAME = 'checkout'
BINDING_OPERATION = 'create' 

while True:
    sleep(random.randrange(50, 5000) / 1000)
    orderId = random.randint(1, 1000)
    with DaprClient() as client:
        resp = client.invoke_binding(BINDING_NAME, BINDING_OPERATION, json.dumps(orderId))
    logging.basicConfig(level = logging.INFO)
    logging.info('Sending message: ' + str(orderId))
    