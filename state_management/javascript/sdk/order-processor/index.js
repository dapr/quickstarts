import { DaprClient, CommunicationProtocolEnum } from 'dapr-client'; 

const DAPR_HOST = '127.0.0.1'; 

var main = function() {
    for(var i=0;i<10;i++) {
        sleep(5000);
        var orderId = Math.floor(Math.random() * (1000 - 1) + 1);
        const client = new DaprClient(DAPR_HOST, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
        const STATE_STORE_NAME = "statestore";
        client.state.save(STATE_STORE_NAME, [
            {
                key: "order_1",
                value: orderId.toString()
            },
            {
                key: "order_2",
                value: orderId.toString()
            }
        ]);
        var result = client.state.get(STATE_STORE_NAME, "order_1");
        result.then(function(val) {
            console.log("Result after get: " + val);
        });
        result = client.state.getBulk(STATE_STORE_NAME, ["order_1", "order_2"]);
        result.then(function(val) {
            console.log("Result after get bulk: " + val);
        });
        client.state.transaction(STATE_STORE_NAME, [
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
        client.state.delete(STATE_STORE_NAME, "order_1");    
        console.log("Order requested: " + orderId);
        result.then(function(val) {
            console.log("Result: " + result);
        });
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();



