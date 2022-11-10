import threading
import time
import logging
import requests
import os
from flask import Flask, request

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
APP_PORT = os.getenv('APP_PORT', '6001')
BASE_URL = os.getenv('BASE_URL', 'http://localhost') + ':' + os.getenv(
                    'DAPR_HTTP_PORT', '3500')
DAPR_CONFIGURATION_STORE = 'configstore'
CONFIGURATION_ITEMS = ['orderId1', 'orderId2']

# Get config items from the config store
for item in CONFIGURATION_ITEMS:
    config = requests.get(
        url='%s/v1.0-alpha1/configuration/%s?key=%s' % (BASE_URL, DAPR_CONFIGURATION_STORE, item)
        )
    if config.status_code == 200:
        logging.info('Configuration for ' +item+ ": " + str(config.json()))
    else:
        logging.info('Could not get config item, err: ' + str(config.json()))

def subscribe_config_updates():
    # Add delay to allow app channel to be ready
    time.sleep(3)
    subscription = requests.get(
        url = '%s/v1.0-alpha1/configuration/%s/subscribe' % (BASE_URL, DAPR_CONFIGURATION_STORE)
            )
    if subscription.status_code == 200 and 'errCode' not in str(subscription.json()) :
        logging.info('App subscribed to config changes with subscription id: ' + str(subscription.json()['id']))
    else:
        logging.info('Error subscribing to config updates: ' + str(subscription.json()))
        exit(1)

# Create POST endpoint to receive config updates
@app.route('/configuration/configstore/<configItem>', methods=['POST'])
def config_subscriber(configItem):
    print('Configuration update ' + str(request.json['items']), flush=True)
    return '' , 200

# Start the flask app
threading.Thread(target=lambda: app.run(port=APP_PORT, debug=False, use_reloader=False), daemon=True).start()
# Subscribe to config updates
subscribe_config_updates()

#Exit app after 20 seconds
time.sleep(20)