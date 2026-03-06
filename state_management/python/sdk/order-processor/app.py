from time import sleep
from dapr.clients import DaprClient

DAPR_STORE_NAME = "statestore"
with DaprClient() as client:
    for i in range(1, 100):
        orderId = str(i)
        order = {'orderId': orderId}

        # Save state into the state store
        client.save_state(DAPR_STORE_NAME, orderId, str(order))
        print(f'Saving Order: {order}')

        # Get state from the state store
        result = client.get_state(DAPR_STORE_NAME, orderId)
        print(f'Result after get: {result.data}')

        # Delete state from the state store
        client.delete_state(store_name=DAPR_STORE_NAME, key=orderId)
        print(f'Deleting Order: {order}')
        sleep(1)
