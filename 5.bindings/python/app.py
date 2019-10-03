import time
import requests
import os

actions_url = "http://localhost:5000/v1.0/bindings/sith"
n = 0
while True:
    n += 1
    payload = { "data": {"orderId": n}}
    print(payload, flush=True)
    try:
        response = requests.post(actions_url, json=payload)
        print(response, flush=True)

    except Exception as e:
        print(e)

    time.sleep(1)
