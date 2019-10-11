// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// ------------------------------------------------------------

const express = require('express');
const bodyParser = require('body-parser');
require('isomorphic-fetch');

const app = express();
app.use(bodyParser.json());

const port = 3000;

app.post('/sample-topic', (req, res) => {
    console.log("Hello from Kafka!");
    console.log(req.body);
    res.status(200).send();
});

app.listen(port, () => console.log(`Node App listening on port ${port}!`));