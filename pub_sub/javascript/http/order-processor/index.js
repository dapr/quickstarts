import express from 'express';
import bodyParser from 'body-parser';

const APP_PORT = process.env.APP_PORT ?? '5003';

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
    try {
        console.log("Subscriber received: " + JSON.stringify(req.body.data));
        res.json({ status: "SUCCESS" });
    } catch (error) {
        console.error("Order processing failed:", error);
        res.json({ status: "RETRY" });
    }
});

app.listen(APP_PORT).on('error', error => {
    console.error(error);
    process.exitCode = 1;
});