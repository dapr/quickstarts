import random
from time import sleep
import logging
from dapr.clients import DaprClient

logging.basicConfig(level=logging.INFO)

DAPR_STORE_NAME = "statestore"
while True:
    order = {'orderId': random.randint(1, 1000)}
    with DaprClient() as client:

        # Save state into the state store
        client.save_state(DAPR_STORE_NAME, "orderId", str(order))

        # Get state from the state store
        result = client.get_state(DAPR_STORE_NAME, "orderId")
        logging.info('Result after get: ' + str(result.data))

        # Delete state from the state store
        client.delete_state(store_name=DAPR_STORE_NAME, key="orderId")
        logging.info('Order requested: ' + str(order))
        logging.info('Result: ' + str(result.data))
        
    sleep(random.randrange(50, 5000) / 1000)
