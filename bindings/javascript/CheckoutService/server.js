import { DaprServer, CommunicationProtocolEnum } from 'dapr-client'; 

const daprHost = "127.0.0.1"; 
const serverHost = "127.0.0.1";
const serverPort = "6002"; 
const daprPort = "3602"; 

start().catch((e) => {
    console.error(e);
    process.exit(1);
});

async function start() {
    const server = new DaprServer(serverHost, serverPort, daprHost, daprPort, CommunicationProtocolEnum.HTTP);
    await server.binding.receive('checkout', async (orderId) => console.log(`Received Message: ${JSON.stringify(orderId)}`));
    await server.startServer();
}