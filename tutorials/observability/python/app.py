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

import flask
from flask import request, jsonify
from flask_cors import CORS
import math
import sys
import time
import os

port = os.getenv("APP_PORT","5001")

app = flask.Flask(__name__)
CORS(app)

@app.route('/multiply', methods=['POST'])
def multiply():
    ######################################################
    # Adding this call to sleep() to slow down the multipier
    time.sleep(1)
    ######################################################
    content = request.json
    [operand_one, operand_two] = [float(content['operandOne']), float(content['operandTwo'])]
    print(f"Calculating {operand_one} * {operand_two}", flush=True)
    return jsonify(math.ceil(operand_one * operand_two * 100000)/100000)

app.run(host="0.0.0.0",port=port)
