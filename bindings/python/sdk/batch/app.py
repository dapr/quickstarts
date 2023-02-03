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
# dapr run --app-id batch-sdk --app-port 50051
#   --resources-path ../../../components -- python3 app.py

import json
from flask import Flask
from dapr.clients import DaprClient
import os

app = Flask(__name__)
cron_binding_name = 'cron'
sql_binding = 'sqldb'
app_port = os.getenv('APP_PORT', '5001')


# Triggered by Dapr input binding
@app.route('/' + cron_binding_name, methods=['POST'])
def process_batch():

    print('Processing batch..', flush=True)

    json_file = open('../../../orders.json', 'r')
    json_array = json.load(json_file)

    for order_line in json_array['orders']:
        sql_output(order_line)

    json_file.close()

    print('Finished processing batch')

    return 'Finished processing batch'


def sql_output(order_line):

    with DaprClient() as d:
        sqlCmd = ('insert into orders (orderid, customer, price) values ' +
                  '(%s, \'%s\', %s)' % (order_line['orderid'],
                                        order_line['customer'],
                                        order_line['price']))
        payload = {'sql': sqlCmd}

        print(sqlCmd, flush=True)

        try:
            # Insert order using Dapr output binding via HTTP Post
            resp = d.invoke_binding(binding_name=sql_binding, operation='exec',
                                    binding_metadata=payload, data='')
            return resp
        except Exception as e:
            print(e, flush=True)
            raise SystemExit(e)


app.run(port=app_port)
