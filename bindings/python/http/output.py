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
# dapr run --app-id python-output-binding-http --app-port 4002 --dapr-http-port 4001 python3 output.py --components-path ../../components

import time
import requests

dapr_port = 4001
binding_name = "sample-topic"

dapr_url = "http://localhost:{}/v1.0/bindings/{}".format(dapr_port, binding_name)
n = 0
while n < 10:
    n += 1
    payload = '{ "data": {"orderId":' + str(n) + '}, "operation": "create" }'
    print('Python - Kafka HTTP output binding: ' + payload, flush=True)
    try:
        response = requests.post(dapr_url,payload)

    except Exception as e:
        print(e, flush=True)

    time.sleep(0.1)
