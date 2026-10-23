import { setTimeout as sleep } from "node:timers/promises";
import axios from "axios";

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";
const PUBSUB_NAME = "orderpubsub";
const PUBSUB_TOPIC = "orders";
const dapr = axios.create({ baseURL: `${DAPR_HOST}:${DAPR_HTTP_PORT}`, timeout: 10000 });

async function main() {
  for (let i = 1; i <= 5; i++) {
    const order = { orderId: i };

    await dapr.post(`/v1.0/publish/${PUBSUB_NAME}/${PUBSUB_TOPIC}`, order);
    console.log("Published data: " + JSON.stringify(order));
    await sleep(1000);
  }

  const orders = [6, 7, 8, 9, 10].map(orderId => ({ orderId }));

  // A non-2xx response (including partial bulk failure) rejects with its response body.
  const result = await dapr.post(`/v1.0/publish/bulk/${PUBSUB_NAME}/${PUBSUB_TOPIC}`,
    orders.map(order => ({
      entryId: String(order.orderId),
      event: order,
      contentType: "application/json",
    }))
  );
  if (result.data?.failedEntries?.length > 0) {
    throw new Error(`Bulk publish failed: ${JSON.stringify(result.data.failedEntries)}`);
  }
  console.log("Bulk published orders: 6,7,8,9,10");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});