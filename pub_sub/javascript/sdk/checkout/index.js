import assert from "node:assert/strict";
import { setTimeout as sleep } from "node:timers/promises";
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const daprHost = process.env.DAPR_HOST || "127.0.0.1";
const daprPort = process.env.DAPR_GRPC_PORT || "50001";
const pubSubName = "orderpubsub";
const pubSubTopic = "orders";
const stateStore = "orderstate";

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
    const items = orders.map(order => ({ key: `order-${order.orderId}`, value: order }));
    await client.state.save(stateStore, items);

    const saved = await client.state.getBulk(stateStore, items.map(item => item.key));
    for (const item of items) {
      const entry = saved.find(entry => entry.key === item.key);
      assert.ok(entry && !entry.error, `Could not read ${item.key}`);
      assert.deepEqual(entry.data, item.value);
    }
    console.log("Saved temporary orders: 5");

    const result = await client.pubsub.publishBulk(pubSubName, pubSubTopic,
      orders.map(order => ({
        entryID: String(order.orderId),
        event: order,
        contentType: "application/json",
      }))
    );
    if (result.failedMessages.length > 0) {
      console.error("Bulk publish failed:", result.failedMessages);
      throw new Error("Not all orders were published; temporary state was retained");
    }
    console.log("Bulk published orders: 6,7,8,9,10");

    // This deletes temporary state, not messages from the broker.
    await client.state.deleteBulk(stateStore, items.map(({ key }) => ({ key })));
    const remaining = await client.state.getBulk(stateStore, items.map(item => item.key));
    assert.equal(remaining.length, items.length);
    assert.ok(remaining.every(entry => entry.data === ""),
      "Temporary orders still exist after deletion");
    console.log("Deleted temporary orders: 5");
    console.log("Remaining temporary orders: 0");
  } finally {
    await client.stop();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
