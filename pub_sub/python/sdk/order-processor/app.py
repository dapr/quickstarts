from flask import Flask, request, jsonify
from cloudevents.core.bindings.http import from_http_event, HTTPMessage
import json
import os

app = Flask(__name__)

app_port = os.getenv('APP_PORT', '6002')

# Register Dapr pub/sub subscriptions
@app.route('/dapr/subscribe', methods=['GET'])
def subscribe():
    subscriptions = [{
        'pubsubname': 'orderpubsub',
        'topic': 'orders',
        'route': 'orders'
    }]
    print('Dapr pub/sub is subscribed to: ' + json.dumps(subscriptions))
    return jsonify(subscriptions)


# Dapr subscription in /dapr/subscribe sets up this route
@app.route('/orders', methods=['POST'])
def orders_subscriber():
    event = from_http_event(HTTPMessage(dict(request.headers), request.get_data()))
    print('Subscriber received : %s' % event.get_data()['orderId'], flush=True)
    return json.dumps({'success': True}), 200, {
        'ContentType': 'application/json'}


app.run(port=app_port)
