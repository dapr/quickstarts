# ------------------------------------------------------------
# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
# ------------------------------------------------------------

import time
import requests
import os

dapr_port = os.getenv("DAPR_HTTP_PORT", 3500)

dapr_url = "http://localhost:{}/v1.0/bindings/sample-topic".format(dapr_port)
n = 0
while True:
    n += 1
    payload = { "data": {"orderId": n}, "operation": "create" }
    print(payload, flush=True)
    try:
        response = requests.post(dapr_url, json=payload)
        print(response, flush=True)

    except Exception as e:
        print(e, flush=True)

    time.sleep(1)
