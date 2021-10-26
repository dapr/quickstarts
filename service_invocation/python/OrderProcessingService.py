import flask
import logging

from dapr.clients import DaprClient
from Order import Order

app = flask.Flask(__name__)
app.config["DEBUG"] = True


@app.route('/order/<orderId>', methods=['GET'])
def getProcessedOrder(orderId: int):
    with DaprClient() as daprClient:
        result = daprClient.invoke_method(
            "checkoutservice",
               f"checkout/{orderId}",
               data=b'',
               http_verb="GET"
        )    
    logging.basicConfig(level = logging.INFO)
    logging.info('Order requested: ' + orderId)
    logging.info('Result: ' + result)
    return str(Order("order1", orderId))

app.run(host="localhost", port=6001, debug=True)