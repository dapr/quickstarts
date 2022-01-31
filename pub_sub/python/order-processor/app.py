import flask
from flask import request, jsonify
# from cloudevents.sdk.event import v1
# from dapr.ext.grpc import App
import json

app = flask.Flask(__name__)
# app = App()
# @app.subscribe(pubsub_name='order_pub_sub', topic='orders')
# def orders_subscribe(event: v1.Event) -> None:
#     data = json.loads(event.Data())
#     logging.info('Subscriber received: ' + str(data))
#     return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}


@app.route('/dapr/subscribe', methods=['GET'])
def subscribe():
    subscriptions = [{'pubsubname': 'order_pub_sub', 'topic': 'orders', 'route': 'orders'}]
    return jsonify(subscriptions)


@app.route('/orders', methods=['POST'])
def a_subscriber():
    print(f'orders: {request.json}', flush=True)
    print('Received message "{}" on topic "{}"'.format(request.json['data']['orderid'], request.json['topic']), flush=True)
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 


app.run(port=5001)
