import { DaprClient } from 'dapr-client'; 

const DAPR_HOST = '127.0.0.1'; 

async function main() {
    for (;;) {
        sleep(5000);
        const order = {orderId: Math.floor(Math.random() * (1000 - 1) + 1)};
        const client = new DaprClient(DAPR_HOST, process.env.DAPR_HTTP_PORT);
        const STATE_STORE_NAME = "statestore";
        // Save state into the state store
        client.state.save(STATE_STORE_NAME, [
            {
                key: "orderId",
                value: order.toString()
            }
        ]);
        // Get state from the state store
        var result = client.state.get(STATE_STORE_NAME, "orderId");
        result.then(function(val) {
            console.log("Result after get: ", val);
        });
        // Delete state from the state store
        client.state.delete(STATE_STORE_NAME, "orderId");    
        console.log("Order requested: ", order);
        result.then(function(val) {
            console.log("Result: ", val);
        });
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(e => console.error(e))



