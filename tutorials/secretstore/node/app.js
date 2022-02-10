// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// ------------------------------------------------------------

const express = require('express');
const bodyParser = require('body-parser');
require('isomorphic-fetch');
require('base-64')
require('node-fetch')

const app = express();
app.use(bodyParser.json());

const daprPort = process.env.DAPR_HTTP_PORT || 3500;
const secretStoreName = process.env.SECRET_STORE; 
const secretName = 'mysecret'

const secretsUrl = `http://localhost:${daprPort}/v1.0/secrets`;

const port = 3000;

app.get('/getsecret', (_req, res) => {
    const url = `${secretsUrl}/${secretStoreName}/${secretName}?metadata.namespace=default`
    console.log("Fetching URL: %s", url)
    fetch(url)
    .then(res => res.json())
    .then(json => {
        let secretBuffer = Buffer.from(json["mysecret"])
        let encodedSecret = secretBuffer.toString('base64')
        console.log("Base64 encoded secret is: %s", encodedSecret)
        return res.send(encodedSecret)
    })
});

app.listen(port, () => console.log(`Node App listening on port ${port}!`));
