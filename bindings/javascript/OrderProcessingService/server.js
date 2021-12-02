import { DaprServer, DaprClient, CommunicationProtocolEnum } from 'dapr-client'; 

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
    const BINDING_NAME = "checkout";
    const BINDING_OPERATION = "create";
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const result = await client.binding.send(BINDING_NAME, BINDING_OPERATION, { orderId: orderId });
    console.log("Sending message: " + orderId);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();



