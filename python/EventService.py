import random
from time import sleep    
import requests
import logging
logging.basicConfig(level = logging.INFO)
    

while True:
    sleep(random.randrange(50, 5000) / 1000)
    orderId = random.randint(1, 1000)
    uri = 'http://localhost:6001/order/' + str(orderId)
    result = requests.get(uri)
    logging.info('Order processed for order id ' + str(orderId))
    logging.info(result)
    

