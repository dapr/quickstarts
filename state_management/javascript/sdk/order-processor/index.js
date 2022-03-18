import { DaprClient } from 'dapr-client'; 

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";

async function main() {
    for(var i = 1; i <= 10; i++) {
        const orderId = i;
        const order = {orderId: orderId};
        const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT);
        const STATE_STORE_NAME = "statestore";

        // Save state into the state store
        client.state.save(STATE_STORE_NAME, [
            {
                key: orderId.toString(),
                value: order
            }
        ]);
        console.log("Saving Order: ", order);

        // Get state from the state store
        var result = client.state.get(STATE_STORE_NAME, orderId.toString());
        result.then(function(val) {
            console.log("Getting Order: ", val);
        });

        // Delete state from the state store
        client.state.delete(STATE_STORE_NAME, orderId.toString());    
        result.then(function(val) {
            console.log("Deleting Order: ", val);
        });

        sleep(5000);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(e => console.error(e))



