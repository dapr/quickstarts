import asyncio
import json
import threading
import time
import logging
from dapr.clients import DaprClient
from dapr.clients.grpc._response import ConfigurationResponse

logging.basicConfig(level=logging.INFO)

DAPR_CONFIGURATION_STORE = 'configstore'
CONFIGURATION_KEYS = ['orderId1', 'orderId2']

with DaprClient() as client:
    # Get config items from the config store
    for key in CONFIGURATION_KEYS:
        resp = client.get_configuration(store_name=DAPR_CONFIGURATION_STORE, keys=[key], config_metadata={})
        print(f"Configuration for {key} : {resp.items[key].value}", flush=True)

def handler(id: str, resp: ConfigurationResponse):
    for key in resp.items:
        print(f"Configuration update {key} : {resp.items[key].value}", flush=True)


async def subscribe_config():
    with DaprClient() as d:
        # Subscribe to configuration for keys {orderId1,orderId2}.
        id = d.subscribe_configuration(store_name=DAPR_CONFIGURATION_STORE, keys=CONFIGURATION_KEYS,
                                       handler=handler, config_metadata={})
        print("Subscription ID is", id, flush=True)
        time.sleep(20)

        # Unsubscribe from configuration
        isSuccess = d.unsubscribe_configuration(store_name=DAPR_CONFIGURATION_STORE, id=id)
        if isSuccess == True:
            print("App unsubscribed from config changes", flush=True)
        else:
            print("Error unsubscribing from config updates", flush=True)

asyncio.run(subscribe_config())
