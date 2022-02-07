from fastapi import FastAPI
# from cloudevents.http import from_http
from dapr.ext.fastapi import DaprApp

app = FastAPI()
dapr_app = DaprApp(app)


# Dapr subscription routes orders topic to this route
@dapr_app.subscribe(pubsub='order_pub_sub', topic='orders')
def orders_subscriber(detail):
    print('got here')
