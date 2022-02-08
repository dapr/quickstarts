import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json({ type: 'application/*+json' }));

app.get('/dapr/subscribe', (_req, res) => {
    res.json([
        {
            pubsubname: "order_pub_sub",
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

app.listen(5001);