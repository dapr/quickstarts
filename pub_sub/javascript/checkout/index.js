import { DaprClient } from 'dapr-client';
import { v4 as uuidv4 } from 'uuid';

const DAPR_HOST = process.env.DAPR_HOST || "127.0.0.1";
const DAPR_PORT = process.env.DAPR_PORT || 3500;

async function main() {
  const client = new DaprClient(DAPR_HOST, DAPR_PORT);

  while (true) {
    await client.pubsub.publish("order_pub_sub", "orders", { orderId: uuidv4() });
    await sleep(1000);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(e => console.error(e))