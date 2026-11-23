import { DaprClient } from "@dapr/dapr";
import express from "express";
import { CustomerInfo, Order, ShipmentRegistrationStatus, ShippingDestinationResult } from "./models";

const DAPR_PUBSUB_COMPONENT = "shippingpubsub";
const DAPR_PUBSUB_CONFIRMED_TOPIC = "shipment-registration-confirmed-events";

const app = express();
// Pub/sub messages arrive as CloudEvents (`application/cloudevents+json`).
app.use(express.json({ type: ["application/json", "application/*+json"] }));

const daprClient = new DaprClient();

/*
 * The workflow app calls this endpoint with the Dapr service invocation API.
 */
app.post("/checkDestination", (req, res) => {
  const customerInfo = req.body as CustomerInfo;
  console.log(`checkDestination: Received input: ${JSON.stringify(customerInfo)}.`);
  const result: ShippingDestinationResult = { is_success: true };
  res.status(200).json(result);
});

/*
 * This endpoint handles messages that are published to the shipment-registration-events topic.
 * It publishes the result to the shipment-registration-confirmed-events topic.
 */
app.post("/registerShipment", async (req, res, next) => {
  try {
    const order = req.body.data as Order;
    console.log(`registerShipment: Received input: ${JSON.stringify(order)}.`);

    const status: ShipmentRegistrationStatus = { order_id: order.id, is_success: true };
    const result = await daprClient.pubsub.publish(DAPR_PUBSUB_COMPONENT, DAPR_PUBSUB_CONFIRMED_TOPIC, status);
    if (result.error) {
      throw result.error;
    }
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
});

const server = app.listen(5261, () => {
  console.log("Listening on port 5261");
});

async function stop() {
  server.close();
  await daprClient.stop();
}

process.once("SIGTERM", () => { void stop(); });
process.once("SIGINT", () => { void stop(); });
