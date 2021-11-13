import { DaprClient, HttpMethod, CommunicationProtocolEnum } from 'dapr-client'; 

const daprHost = "127.0.0.1"; 

var main = function() {
    for(var i=0;i<10;i++) {
        sleep(5000);
        var orderId = Math.floor(Math.random() * (1000 - 1) + 1);
        start(orderId).catch((e) => {
            console.error(e);
            process.exit(1);
        });
    }
}

async function start(orderId) {
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const STATE_STORE_NAME = "statestore";
    await client.state.save(STATE_STORE_NAME, [
        {
            key: "order_1",
            value: orderId.toString()
        },
        {
            key: "order_2",
            value: orderId.toString()
        }
    ]);
    var result = await client.state.get(STATE_STORE_NAME, "order_1");

    console.log("Result after get: " + result);

    result = await client.state.getBulk(STATE_STORE_NAME, ["order_1", "order_2"]);

    console.log("Result after get bulk: " + result);

    await client.state.transaction(STATE_STORE_NAME, [
        {
        operation: "upsert",
        request: {
            key: "order_3",
            value: orderId.toString()
        }
        },
        {
        operation: "delete",
        request: {
            key: "order_2"
        }
        }
    ]);

    await client.state.delete(STATE_STORE_NAME, "order_1");    

    console.log("Order requested: " + orderId);
    console.log("Result: " + result);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();



