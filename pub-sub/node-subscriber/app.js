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

app.get('/dapr/subscribe', (_req, res) => {
    res.json([
        {
            pubsubname: "pubsub",
            topic: "A",
            route: "A"
        },
        {
            pubsubname: "pubsub",
            topic: "B",
            route: "B"
        }
    ]);
});

app.post('/A', (req, res) => {
    console.log("A: ", req.body);
    res.sendStatus(200);
});

app.post('/B', (req, res) => {
    console.log("B: ", req.body);
    res.sendStatus(200);
});

app.listen(port, () => console.log(`Node App listening on port ${port}!`));
