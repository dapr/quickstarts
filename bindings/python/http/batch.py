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
# dapr run --app-id python-binding-quickstart-http --app-port 5001 --dapr-http-port 4001 python3 batch.py --components-path ../../components

import json 
from flask import Flask
import requests
import os

app = Flask(__name__)

app_port = os.getenv('APP_PORT', '5001')
dapr_port = os.getenv('DAPR_HTTP_PORT', '4001')
cron_binding_name = '/batch'
sql_binding_name = 'SqlDB'
dapr_url = "http://localhost:{}/v1.0/bindings/{}".format(dapr_port, sql_binding_name)


# Dapr input binding
@app.route(cron_binding_name, methods=['POST'])
def cron_binding():

    json_file = open("../../orders.json", "r")
    json_array = json.load(json_file)

    for order_line in json_array['orders']:
        sql_output(order_line)

    json_file.close()
    print('Cron event processed', flush=True)
    return 'Cron event processed'


def sql_output(order_line):

    sqlCmd = ('insert into orders (orderid, customer, price) values ('
              '{}, \'{}\', {});'.format(
                  order_line['orderid'], order_line['customer'],
                  order_line['price']))
    payload = ('{  "operation": "exec",  "metadata" : { "sql" : "' +
               sqlCmd + '" } }')
    print(payload, flush=True)
    try:
        requests.post(dapr_url, payload)

    except Exception as e:
        print(e, flush=True)


app.run(port=app_port)
