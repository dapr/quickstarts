import random
from time import sleep 
import requests
import flask
import logging

app = flask.Flask(__name__)
app.config["DEBUG"] = True


@app.route('/order', methods=['GET'])
def getOrder():
    logging.basicConfig(level = logging.INFO)
    sleep(random.randrange(50, 5000) / 1000)
    orderId = random.randint(1, 1000)
    daprPort = '3602'
    daprUrl = 'http://localhost:' + daprPort + '/v1.0/invoke/checkout/method/checkout/' + str(orderId); 
    result = requests.get(daprUrl, params={})
    logging.info('Order requested: ' + str(orderId))
    logging.info('Result: ' + str(result))
    return str(result)

app.run(host="localhost", port=6001, debug=True)