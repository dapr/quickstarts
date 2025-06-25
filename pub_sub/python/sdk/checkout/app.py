from dapr.clients import DaprClient
import json
import time
import logging

logging.basicConfig(level=logging.INFO)

with DaprClient() as client:
    for i in range(1, 3):
        order = {'orderId': i}
        # Publish an event/message using Dapr PubSub
        result = client.publish_event(
            pubsub_name='orderpubsub',
            topic_name='orders',
            data=json.dumps(order),
            data_content_type='application/json',
        )
        logging.info('Published data: ' + json.dumps(order))
        time.sleep(1)
