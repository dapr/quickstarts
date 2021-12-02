import logging
from dapr.ext.grpc import App, BindingRequest

app = App()

@app.binding('checkout')
def getCheckout(request: BindingRequest):
    logging.basicConfig(level = logging.INFO)
    logging.info('Received Message : ' + request.text())

app.run(6002)