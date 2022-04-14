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

import time
import requests

daprPort = 4001
bindingName = "orders"
daprHost = "http://localhost"

daprUrl = "{}:{}/v1.0/bindings/{}".format(daprHost,daprPort, bindingName)
n = 0
while n < 10:
    n += 1
    payload = '{ "data": {"orderId":' + str(n) + '}, "operation": "create" }'
    print('Output binding: ' + payload, flush=True)
    try:
        response = requests.post(daprUrl,payload)

    except Exception as e:
        print(e, flush=True)

    time.sleep(0.1)
