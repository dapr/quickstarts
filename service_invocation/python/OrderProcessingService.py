import random
from time import sleep    
import requests
import logging
from dapr.clients import DaprClient

logging.basicConfig(level = logging.INFO)
    

while True:
    sleep(random.randrange(50, 5000) / 1000)
    orderId = random.randint(1, 1000)
    with DaprClient() as daprClient:
        result = daprClient.invoke_method(
            "checkoutservice",
               f"checkout/{orderId}",
               data=b'',
               http_verb="GET"
        )    
    logging.basicConfig(level = logging.INFO)
    logging.info('Order requested: ' + str(orderId))
    logging.info('Result: ' + str(result))
    

