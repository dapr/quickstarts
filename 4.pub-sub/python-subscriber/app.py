# ------------------------------------------------------------
# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
# ------------------------------------------------------------

import flask
from flask import request, jsonify
from flask_cors import CORS
import json
import sys

app = flask.Flask(__name__)
CORS(app)

@app.route('/v1.0/dapr/subscribe', methods=['GET'])
def subscribe():
    subscriptions = [{'topic': 'A', 'route': 'A'}, {'topic': 'C', 'route': 'C'}]
    return jsonify(subscriptions)

@app.route('/v1.0/A', methods=['POST'])
def a_subscriber():
    print(f'A: {request.json}', flush=True)
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 

@app.route('/v1.0/C', methods=['POST'])
def c_subscriber():
    print(f'C: {request.json}', flush=True)
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 

app.run()
