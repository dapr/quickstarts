from dapr.clients import DaprClient
import json
import time
import random
import logging

logging.basicConfig(level=logging.INFO)

while True:
    order = {"orderid": random.randint(1, 1000)}

    with DaprClient() as client:
        # publish an event using Dapr pub/sub
        result = client.publish_event(
            pubsub_name="order_pub_sub",
            topic_name="orders",
            data=json.dumps(order),
            data_content_type="application/json",
        )

    logging.info("Published data: " + json.dumps(order))
    time.sleep(1)
