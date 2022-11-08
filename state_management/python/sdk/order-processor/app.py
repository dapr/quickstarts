from time import sleep
import logging
from dapr.clients import DaprClient

logging.basicConfig(level=logging.INFO)

DAPR_STORE_NAME = "statestore"
for i in range(1, 100):
    orderId = str(i)
    order = {'orderId': orderId}
    with DaprClient() as client:

        # Save state into the state store
        client.save_state(DAPR_STORE_NAME, orderId, str(order))
        logging.info('Saving Order: %s', order)

        # Get state from the state store
        result = client.get_state(DAPR_STORE_NAME, orderId)
        logging.info('Result after get: ' + str(result.data))

        # Delete state from the state store
        client.delete_state(store_name=DAPR_STORE_NAME, key=orderId)
        logging.info('Deleting Order: %s', order)
        
    sleep(1)
