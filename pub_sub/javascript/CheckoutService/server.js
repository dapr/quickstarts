import { DaprServer, CommunicationProtocolEnum } from 'dapr-client'; 

const daprHost = "127.0.0.1"; 
const serverHost = "127.0.0.1";
const serverPort = "6002"; 

start().catch((e) => {
    console.error(e);
    process.exit(1);
});

async function start(orderId, response) {
    const PUBSUB_NAME = "order_pub_sub"
	const TOPIC_NAME  = "orders"
    const server = new DaprServer(
        serverHost, 
        serverPort, 
        daprHost, 
        process.env.DAPR_HTTP_PORT, 
        CommunicationProtocolEnum.HTTP
     );
     await server.pubsub.subscribe(PUBSUB_NAME, TOPIC_NAME, async (orderId) => {
        console.log(`Subscriber received: ${JSON.stringify(orderId)}`)
    }, (response) => {
        response.sendStatus(200);
    });
    await server.startServer();
}