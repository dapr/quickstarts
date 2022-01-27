const express = require('express');
const bodyParser = require('body-parser');
const app = express();

var XMLHttpRequest = require('xhr2');

const port = 6001;

app.get('/order', (req, res) => {
    var orderId = Math.floor(Math.random() * (1000 - 1) + 1);
    var daprPort = '3602';
    var daprUrl = 'http://localhost:' + daprPort + '/v1.0/invoke/checkout/method/checkout/' + orderId;
    var request = new XMLHttpRequest();
    request.open('GET', daprUrl);
    request.send();
    console.log("Order requested: " + orderId);
});

app.listen(port, () => {
    console.log("We are live on port: " + port);
});



