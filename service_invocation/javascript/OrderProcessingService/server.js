import { DaprClient, HttpMethod, CommunicationProtocolEnum } from 'dapr-client'; 
import express from 'express';

const app = express();

const port = 6001;
const daprHost = "127.0.0.1"; 
const daprPort = "3601"; 

class Order {
    constructor(orderName, orderNum) {
      this.orderName = orderName;
      this.orderNum = orderNum;
    }
}

app.get('/order/:id', (req, res) => {
    var orderId = req.params.id;
    start(orderId).catch((e) => {
        console.error(e);
        process.exit(1);
    });
    res.send(new Order("order1",  orderId));
});

async function start(orderId) {
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const result = await client.invoker.invoke('checkoutservice' , "checkout/" + orderId , HttpMethod.GET);
    console.log("Order requested: " + orderId);
    console.log("Result: " + result);
}

app.listen(port, () => {
    console.log("We are live on port: " + port);
});


