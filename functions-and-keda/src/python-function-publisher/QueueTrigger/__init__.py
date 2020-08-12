import logging

import requests
import json
import azure.functions as func

dapr_url = "http://localhost:3500/v1.0"

def main(msg: func.QueueMessage):
    logging.info(f"Python queue-triggered function received a message!")
    message = msg.get_body().decode('utf-8')
    logging.info(f"Message: {message}")

    # Publish an event
    url = f'{dapr_url}/publish/myTopic'
    content = { "message": message }
    logging.info(f'POST to {url} with content {json.dumps(content)}')
    p = requests.post(url, json=content)
    logging.info(f'Got response code {p.status_code}')
