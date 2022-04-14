#
# Copyright 2021 The Dapr Authors
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# dapr run --app-id python-input-binding-http --app-port 5001 python3 input.py --components-path ../../components

from flask import Flask, request, jsonify
import logging

app = Flask(__name__)

logger = logging.getLogger('werkzeug')

# Dapr input binding
@app.route('/sample-topic', methods=['POST'])
def process_binding():
    event_orderid = request.data.decode('utf-8')
    logger.info('Python - Kafka HTTP input binding: ' + event_orderid)
    return 'Python - Kafka HTTP input binding: ' + event_orderid

app.run(port=5001)