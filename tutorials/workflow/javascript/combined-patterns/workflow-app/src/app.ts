import { DaprWorkflowClient, WorkflowRuntime } from "@dapr/dapr";
import express from "express";
import * as im from "./inventoryManagement";
import { Order, ShipmentRegistrationStatus } from "./models";
import {
  SHIPMENT_REGISTERED_EVENT,
  checkInventory,
  checkShippingDestination,
  orderWorkflow,
  processPayment,
  registerShipment,
  reimburseCustomer,
  updateInventory,
} from "./orderWorkflow";

function createWorkflowRuntime(): WorkflowRuntime {
  return new WorkflowRuntime()
    .registerWorkflow(orderWorkflow)
    .registerActivity(checkInventory)
    .registerActivity(checkShippingDestination)
    .registerActivity(processPayment)
    .registerActivity(updateInventory)
    .registerActivity(reimburseCustomer)
    .registerActivity(registerShipment);
}

const app = express();
// Pub/sub messages arrive as CloudEvents (`application/cloudevents+json`).
app.use(express.json({ type: ["application/json", "application/*+json"] }));

/*
 * The DaprWorkflowClient is the API to manage workflows.
 * Here it is used to schedule a new workflow instance and to raise an event to it.
 */
const workflowClient = new DaprWorkflowClient();

/*
 * createDefaultInventory is used to ensure to have enough inventory for the order.
 */
app.post("/start", async (req, res, next) => {
  try {
    const order = req.body as Order;
    await im.createDefaultInventory();

    console.log(`start: Received input: ${JSON.stringify(order)}.`);

    const instanceId = await workflowClient.scheduleNewWorkflow(orderWorkflow, order, order.id);
    res.status(202).json({ instance_id: instanceId });
  } catch (error) {
    next(error);
  }
});

/*
 * This endpoint handles messages that are published to the shipment-registration-confirmed-events topic.
 * It uses the workflow management API to raise an event to the workflow instance to indicate that the
 * shipment has been registered by the shipping app.
 */
app.post("/shipmentRegistered", async (req, res, next) => {
  try {
    const status = req.body.data as ShipmentRegistrationStatus;
    console.log(`shipmentRegistered: Received input: ${JSON.stringify(status)}.`);

    await workflowClient.raiseEvent(status.order_id, SHIPMENT_REGISTERED_EVENT, status);
    res.sendStatus(202);
  } catch (error) {
    next(error);
  }
});

// Listen before the workflow runtime connects, so the Dapr sidecar finds the app port.
const server = app.listen(5260, () => {
  console.log("Listening on port 5260");
});

let workflowRuntime = createWorkflowRuntime();
let stopping = false;

async function stop() {
  stopping = true;
  server.close();
  await workflowRuntime.stop();
  await workflowClient.stop();
}

process.once("SIGTERM", () => { void stop(); });
process.once("SIGINT", () => { void stop(); });

/*
 * The app and the Dapr sidecar start at the same time. The sidecar can open its gRPC port
 * after the app is ready, so the workflow runtime tries again until the sidecar answers.
 */
async function startWorkflowRuntime() {
  for (let attempt = 1; ; attempt++) {
    try {
      await workflowRuntime.start();
      console.log("Workflow runtime started");
      return;
    } catch (error) {
      if (stopping || attempt === 30) {
        throw error;
      }
      await workflowRuntime.stop().catch(() => undefined);
      workflowRuntime = createWorkflowRuntime();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

startWorkflowRuntime().catch((error) => {
  console.error(error);
  process.exit(1);
});
