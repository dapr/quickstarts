from cloudevents.sdk.event import v1
from dapr.ext.grpc import App
import logging

import json

app = App()

logging.basicConfig(level = logging.INFO)

@app.subscribe(pubsub_name='order_pub_sub', topic='orders')
def mytopic(event: v1.Event) -> None:
    data = json.loads(event.Data())
    logging.info('Subscriber received: ' + data)

app.run(60002)