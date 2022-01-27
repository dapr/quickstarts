import flask
import logging

app = flask.Flask(__name__)
app.config["DEBUG"] = True


@app.route('/checkout/<orderId>', methods=['GET'])
def getCheckout(orderId: int):
    logging.basicConfig(level = logging.INFO)
    logging.info('Checked out order id : ' + orderId)
    return "CID" + orderId

app.run(host="localhost", port=6002, debug=True)