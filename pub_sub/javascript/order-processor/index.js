// Order Processing = Server which processes items
// Checkout will do the pub sub
import { DaprServer } from 'dapr-client';

const SIDECAR_HOST = process.env.SIDECAR_HOST || "127.0.0.1";
const SIDECAR_PORT = process.env.SIDECAR_PORT || 3500;
const SERVER_HOST = process.env.SERVER_HOST || "127.0.0.1";
const SERVER_PORT = process.env.SERVER_PORT || 5000;

async function main() {
  const server = new DaprServer(SERVER_HOST, SERVER_PORT, SIDECAR_HOST, SIDECAR_PORT);
  server.pubsub.subscribe("order_pub_sub", "orders", (data) => console.log(data));
  await server.start();
}

main().catch(e => console.error(e));