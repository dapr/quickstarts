// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// ------------------------------------------------------------

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const daprPort = process.env.DAPR_HTTP_PORT || 3500;
const port = 3000;

app.get('/echo', (req, res) => {
    var text = req.query.text;    
    console.log("Echoing: " + text);
    res.send("Access token: " + req.headers["authorization"] + " Text: " + text);    
});

app.listen(port, () => console.log(`Node App listening on port ${port}!`));