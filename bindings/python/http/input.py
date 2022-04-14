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

from flask import Flask, request, jsonify
import logging

app = Flask(__name__)

logger = logging.getLogger('werkzeug')

# Dapr input binding
@app.route('/orders', methods=['POST'])
def process_binding():
    eventOrderid = request.data.decode('utf-8')
    logger.info('Input binding: ' + eventOrderid)
    return 'Input binding: ' + eventOrderid

app.run(port=5001)