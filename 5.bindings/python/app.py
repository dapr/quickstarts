# ------------------------------------------------------------
# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
# ------------------------------------------------------------

import time
import requests
import os

dapr_url = "http://localhost:{}/v1.0/bindings/sample-topic".format(os.getenv("DAPR_HTTP_PORT"))
n = 0
while True:
    n += 1
    payload = { "data": {"orderId": n}}
    print(payload, flush=True)
    try:
        response = requests.post(dapr_url, json=payload)
        print(response, flush=True)

    except Exception as e:
        print(e)

    time.sleep(1)
