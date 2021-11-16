const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const port = 6002;

app.get('/checkout/:id', (req, res) => {
    var orderId = req.params.id;
    console.log("Checked out order id : " + orderId);
    console.log("CID" + orderId);
});

app.listen(port, () => {
    console.log("We are live on port: " + port);
});


