import time
import logging
import requests
import os

logging.basicConfig(level=logging.INFO)

base_url = os.getenv('BASE_URL', 'http://localhost') + ':' + os.getenv(
                    'DAPR_HTTP_PORT', '3500')
DAPR_SECRET_STORE = 'localsecretstore'
SECRET_NAME = 'secret'

# Get secret from a local secret store
secret = requests.get(
    url='%s/v1.0/secrets/%s/%s' % (base_url, DAPR_SECRET_STORE, SECRET_NAME)
)
logging.info('Fetched Secret: ' + str(secret.json()))
