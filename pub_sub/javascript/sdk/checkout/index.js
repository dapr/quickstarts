import { DaprClient } from "@dapr/dapr";

const daprHost = process.env.DAPR_HOST || "http://localhost";
const daprPort = process.env.DAPR_HTTP_PORT || "3500";
const pubSubName = "orderpubsub";
const pubSubTopic = "orders";

async function main() {
  const client = new DaprClient({ daprHost, daprPort });

  for (var i = 1; i <= 10; i++) {
    const order = { orderId: i };

    // Publish an event using Dapr pub/sub
    await client.pubsub.publish(pubSubName, pubSubTopic, order);
    console.log("Published data: " + JSON.stringify(order));

    await sleep(1000);
  }
}
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(e => console.error(e));
