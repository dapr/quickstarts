import time
import requests
import os

base_url = os.getenv('BASE_URL', 'http://localhost') + ':' + os.getenv(
                    'DAPR_HTTP_PORT', '3500')
DAPR_SECRET_STORE = 'localsecretstore'
SECRET_NAME = 'secret'

# Get secret from a local secret store
secret = requests.get(
    url='%s/v1.0/secrets/%s/%s' % (base_url, DAPR_SECRET_STORE, SECRET_NAME)
)
print(f'Fetched Secret: {secret.json()}')
