// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// ------------------------------------------------------------

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
// Dapr publishes messages with the application/cloudevents+json content-type
app.use(bodyParser.json({ type: 'application/*+json' }));

const port = 3000;

app.get('/v1.0/dapr/subscribe', (_req, res) => {
    res.json([
        {
            topic: "A",
            route: "A"
        },
        {
            topic: "B",
            route: "B"
        }
    ]);
});

app.post('/v1.0/A', (req, res) => {
    console.log("A: ", req.body);
    res.sendStatus(200);
});

app.post('/v1.0/B', (req, res) => {
    console.log("B: ", req.body);
    res.sendStatus(200);
});

app.listen(port, () => console.log(`Node App listening on port ${port}!`));
