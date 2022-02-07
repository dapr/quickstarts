from flask import Flask, request, jsonify
from cloudevents.http import from_http
import json

app = Flask(__name__)


# Dapr will send pub/sub events to routes defined in subscriptions
@app.route('/dapr/subscribe', methods=['GET'])
def subscribe():
    subscriptions = [{'pubsubname': 'order_pub_sub',
                      'topic': 'orders', 'route': 'orders'}]
    return jsonify(subscriptions)


# Dapr subscription routes orders topic to this route
@app.route('/orders', methods=['POST'])
def orders_subscriber():
    print('raw:' + json.dumps(request.get_json))
    event = from_http(request.headers, request.get_data())
    print('Received message "{}" on topic "{}"'.format(
          event.data['orderid'], event['topic']), flush=True)
    return json.dumps({'success': True}), 200, {
        'ContentType': 'application/json'}


app.run(port=5001)
