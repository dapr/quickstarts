import { DaprServer } from 'dapr-client';

const DAPR_HOST = process.env.DAPR_HOST || "localhost";
const DAPR_PORT = process.env.DAPR_PORT || 3500;
const SERVER_HOST = process.env.SERVER_HOST || "localhost";
const SERVER_PORT = process.env.SERVER_PORT || 5001;

async function main() {
  const server = new DaprServer(SERVER_HOST, SERVER_PORT, DAPR_HOST, DAPR_PORT);

  //Dapr subscription routes orders topic to this route
  server.pubsub.subscribe("order_pub_sub", "orders", (data) => console.log(data));
  
  await server.start();
}

main().catch(e => console.error(e));