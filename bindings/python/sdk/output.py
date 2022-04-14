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

import json
import time

from dapr.clients import DaprClient

with DaprClient() as d:
    bindingName = "orders"
    operation = "create"
    n = 0
    while n < 10:
        n += 1
        req_data = {
            'orderId': n
        }
        print ('Output binding: orderId: ' + str(n),flush=True)

        # Output message to Kafka using an output bindin
        resp = d.invoke_binding(bindingName, operation, json.dumps(req_data))

        time.sleep(0.5)