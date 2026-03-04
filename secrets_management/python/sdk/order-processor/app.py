import logging
from dapr.clients import DaprClient

DAPR_SECRET_STORE = 'localsecretstore'
SECRET_NAME = 'secret'
with DaprClient() as client:
        secret = client.get_secret(store_name=DAPR_SECRET_STORE, key=SECRET_NAME)
        print(f'Fetched Secret: {secret.secret}')
