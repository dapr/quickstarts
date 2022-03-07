// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// ------------------------------------------------------------

const express = require('express');
const axios = require('axios');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use(express.json());

const daprPort = process.env.DAPR_HTTP_PORT ?? 3500;
const daprUrl = `http://localhost:${daprPort}/v1.0`;
const port = 8080;
const pubsubName = 'pubsub';

// Publish to topic (messageType) using Dapr pub-sub
app.post('/publish', async (req, res) => {
  console.log("Publishing: ", req.body);
  await axios.post(`${daprUrl}/publish/${pubsubName}/${req.body?.messageType}`, req.body);
  return res.sendStatus(200);
});

// Serve static files
app.use(express.static(path.join(__dirname, 'client/build')));

// Map default route to React client
app.get('/', async function (_req, res) {
  await res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(process.env.PORT || port, () => console.log(`Listening on port ${port}!`));