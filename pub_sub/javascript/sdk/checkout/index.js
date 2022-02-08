import { DaprClient } from 'dapr-client';

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";
const PUBSUB_NAME = "order_pub_sub";
const PUBSUB_TOPIC = "orders";

async function main() {
  const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT);

  while (true) {
    const rand = Math.floor(Math.random() * 1000);
    const order = {orderId:  rand};

    // Publish an event using Dapr pub/sub
    await client.pubsub.publish(PUBSUB_NAME, PUBSUB_TOPIC, order);
    console.log("Published data: " + JSON.stringify(order));

    await sleep(1000);
  }
}
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(e => console.error(e))