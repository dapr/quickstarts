import asyncio
import json
import threading
import time
import logging
from dapr.clients import DaprClient
from dapr.clients.grpc._response import ConfigurationWatcher

logging.basicConfig(level=logging.INFO)


configuration: ConfigurationWatcher = ConfigurationWatcher()

DAPR_CONFIGURATION_STORE = 'configstore'
CONFIGURATION_ITEMS = ['orderId1', 'orderId2']

with DaprClient() as client:
    # Get config items from the config store
    for config_item in CONFIGURATION_ITEMS:
        config = client.get_configuration(store_name=DAPR_CONFIGURATION_STORE, keys=[config_item], config_metadata={})
        print(f"Configuration for {config_item} : {config.items[config_item]}", flush=True)

async def subscribe_config():
    with DaprClient() as client:
    # Subscribe for configuration changes
        configuration = await client.subscribe_configuration(DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS)
        # Exit app after 20 seconds
        exitTime = time.time() + 20
        while time.time() < exitTime:
            if configuration is not None:
                items = configuration.get_items()
                for key in items:
                    print("Configuration update {'"+key+"' : {'value': '"+ items[key].value +"'}}", flush=True)
            time.sleep(1)
        # Unsubscribe from configuration updates
        unsubscribed = True
        for config_item in CONFIGURATION_ITEMS:
            unsub_item = client.unsubscribe_configuration(DAPR_CONFIGURATION_STORE, config_item)
            if unsub_item is False:
                unsubscribed = False
        if unsubscribed == True:
            print("App unsubscribed from config changes", flush=True)
        else:
            print("Error unsubscribing from config updates", flush=True)

asyncio.run(subscribe_config())



