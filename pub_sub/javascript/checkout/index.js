import { DaprClient } from 'dapr-client';

const DAPR_HOST = process.env.DAPR_HOST || "localhost";
const DAPR_PORT = process.env.DAPR_PORT || 3500;

async function main() {
  const client = new DaprClient(DAPR_HOST, DAPR_PORT);

  while (true) {
    const rand = Math.floor(Math.random() * 1000)
    const order = { orderId:  rand};

    // publish an event using Dapr pub/sub
    await client.pubsub.publish("order_pub_sub", "orders", order);
    console.log("Published data: " + order.orderId);

    await sleep(1000);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(e => console.error(e))