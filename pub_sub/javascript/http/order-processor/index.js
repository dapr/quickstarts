import express from 'express';
import bodyParser from 'body-parser';

const APP_PORT = process.env.APP_PORT ?? '5001';

const app = express();
app.use(bodyParser.json({ type: 'application/*+json' }));

app.get('/dapr/subscribe', (_req, res) => {
    res.json([
        {
            pubsubname: "orderpubsub",
            topic: "orders",
            route: "orders"
        }
    ]);
});

// Dapr subscription routes orders topic to this route
app.post('/orders', (req, res) => {
    console.log("Subscriber received:", req.body.data);
    res.sendStatus(200);
});

app.listen(APP_PORT);