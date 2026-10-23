import { setTimeout as sleep } from "node:timers/promises";
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const daprHost = process.env.DAPR_HOST || "127.0.0.1";
const daprPort = process.env.DAPR_GRPC_PORT || "50001";
const pubSubName = "orderpubsub";
const pubSubTopic = "orders";

async function main() {
  const client = new DaprClient({
    daprHost,
    daprPort,
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });

  try {
    for (let i = 1; i <= 5; i++) {
      const order = { orderId: i };

      await client.pubsub.publish(pubSubName, pubSubTopic, order);
      console.log("Published data: " + JSON.stringify(order));
      await sleep(1000);
    }

    const orders = [6, 7, 8, 9, 10].map(orderId => ({ orderId }));
    const result = await client.pubsub.publishBulk(pubSubName, pubSubTopic,
      orders.map(order => ({
        entryID: String(order.orderId),
        event: order,
        contentType: "application/json",
      }))
    );
    if (result.failedMessages.length > 0) {
      console.error("Bulk publish failed:", result.failedMessages);
      throw new Error("Not all orders were published");
    }
    console.log("Bulk published orders: 6,7,8,9,10");
  } finally {
    await client.stop();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
