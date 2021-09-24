// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// ------------------------------------------------------------

const daprPort = process.env.DAPR_HTTP_PORT || "3500";

// The Dapr endpoint for the state store component to store the tweets.
const pubsubEndpoint = `http://localhost:${daprPort}/v1.0/publish/pubsub/inventory`;

const express = require('express');
const axios = require('axios');

const app = express();
// Dapr publishes messages with the application/cloudevents+json content-type
app.use(express.json({ type: ['application/json', 'application/*+json'] }));

const port = 3000;

app.get('/dapr/subscribe', (_req, res) => {
  // Programmatic subscriptions
  // See ./components/subscription.yaml for declarative subscription.
  //
  res.json([
    // Previous subscription structure.
    // {
    //   pubsubname: "pubsub",
    //   topic: "inventory",
    //   route: "products"
    // }
    //
    // Subscription with routing rules and default route.
    // {
    //   pubsubname: "pubsub",
    //   topic: "inventory",
    //   routes: {
    //     rules: [
    //       {
    //         match: `event.type == "widget"`,
    //         path: "widgets"
    //       },
    //       {
    //         match: `event.type == "gadget"`,
    //         path: "gadgets"
    //       }
    //     ],
    //     default: "products"
    //   }
    // }
  ]);
});

// Default product handler.
app.post('/products', (req, res) => {
  console.log("🤔 PRODUCT (default): ", req.body);
  console.log();
  res.sendStatus(200);
});

// Specific handler for widgets.
app.post('/widgets', (req, res) => {
  console.log("🪛  WIDGET: ", req.body);
  console.log();
  res.sendStatus(200);
});

// Specific handler for gadgets.
app.post('/gadgets', (req, res) => {
  console.log("📱 GADGET: ", req.body);
  console.log();
  res.sendStatus(200);
});

// Allow publishing freeform cloud events to the topic.
app.post('/publish', async (req, res) => {
  console.log("publishing", req.body);
  console.log();
  axios.post(pubsubEndpoint, req.body, {
    headers: {
      'content-type': 'application/cloudevents+json'
    }
  })
    .then(() => { res.sendStatus(200); })
    .catch(error => {
      res.sendStatus(500);
      console.error('There was an error!', error);
    });
});

app.listen(port, () => console.log(`Node App listening on port ${port}!`));
