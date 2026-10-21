import assert from "node:assert/strict";
import { setTimeout as sleep } from "node:timers/promises";
import axios from "axios";

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";
const PUBSUB_NAME = "orderpubsub";
const PUBSUB_TOPIC = "orders";
const STATE_STORE = "orderstate";
const dapr = axios.create({ baseURL: `${DAPR_HOST}:${DAPR_HTTP_PORT}`, timeout: 10000 });

async function main() {
  for (let i = 1; i <= 5; i++) {
    const order = { orderId: i };

    await dapr.post(`/v1.0/publish/${PUBSUB_NAME}/${PUBSUB_TOPIC}`, order);
    console.log("Published data: " + JSON.stringify(order));
    await sleep(1000);
  }

  const orders = [6, 7, 8, 9, 10].map(orderId => ({ orderId }));
  const items = orders.map(order => ({ key: `order-${order.orderId}`, value: order }));
  await dapr.post(`/v1.0/state/${STATE_STORE}`, items);

  const keys = items.map(item => item.key);
  const saved = await dapr.post(`/v1.0/state/${STATE_STORE}/bulk`, { keys });
  for (const item of items) {
    const entry = saved.data.find(entry => entry.key === item.key);
    assert.ok(entry && !entry.error, `Could not read ${item.key}`);
    assert.deepEqual(entry.data, item.value);
  }
  console.log("Saved temporary orders: 5");

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

  // HTTP has no bulk-state-delete endpoint; wait for every individual delete.
  const deleted = await Promise.allSettled(keys.map(key =>
    dapr.delete(`/v1.0/state/${STATE_STORE}/${encodeURIComponent(key)}`)
  ));
  const failures = deleted.filter(result => result.status === "rejected");
  if (failures.length > 0) {
    throw new AggregateError(failures.map(result => result.reason), "State deletion failed");
  }
  const remaining = await dapr.post(`/v1.0/state/${STATE_STORE}/bulk`, { keys });
  assert.equal(remaining.data.length, items.length);
  assert.ok(remaining.data.every(entry => !entry.error && entry.data == null),
    "Temporary orders still exist after deletion");
  console.log("Deleted temporary orders: 5");
  console.log("Remaining temporary orders: 0");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});