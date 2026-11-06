import assert from "node:assert/strict";
import { setImmediate } from "node:timers/promises";
import { CommunicationProtocolEnum, DaprClient, DaprPubSubStatusEnum } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: process.env.DAPR_HOST || "127.0.0.1",
  daprPort: process.env.DAPR_GRPC_PORT || "50001",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
});

async function main() {
  try {
    let onReceived;
    const received = new Promise(resolve => { onReceived = resolve; });
    const order = { orderId: 11 };
    const subscription = await client.pubsub.subscribeStream("orderpubsub", "orders-stream", data => {
      assert.deepEqual(data, order);
      console.log("Streaming subscriber received: " + JSON.stringify(data));
      onReceived();
      return DaprPubSubStatusEnum.SUCCESS;
    }, { signal: AbortSignal.timeout(15000) });
    console.log("Streaming subscription opened");

    try {
      await Promise.race([
        (async () => {
          await client.pubsub.publish("orderpubsub", "orders-stream", order);
          console.log("Streaming published data: " + JSON.stringify(order));
          await received;
        })(),
        subscription.closed.then(() => {
          throw new Error("Streaming subscription closed before the order was received");
        }),
      ]);
      // Let the SDK acknowledge the callback before cancelling the stream.
      await setImmediate();
    } finally {
      await subscription.close();
      await subscription.closed;
    }
    console.log("Streaming subscription closed");
  } finally {
    // Stopping the client alone does not close streaming subscriptions.
    await client.stop();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
