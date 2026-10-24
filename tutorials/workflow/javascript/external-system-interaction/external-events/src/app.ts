import { DaprWorkflowClient, WorkflowRuntime } from "@dapr/dapr";
import express from "express";
import { Order, externalEventsWorkflow, processOrder, requestApproval, sendNotification } from "./externalEventsWorkflow";

const workflowRuntime = new WorkflowRuntime()
  .registerWorkflow(externalEventsWorkflow)
  .registerActivity(requestApproval)
  .registerActivity(sendNotification)
  .registerActivity(processOrder);

const app = express();
app.use(express.json());

/*
 * The DaprWorkflowClient is the API to manage workflows.
 * Here it is used to schedule a new workflow instance.
 */
const workflowClient = new DaprWorkflowClient();

app.post("/start", async (req, res, next) => {
  try {
    const order = req.body as Order;
    console.log(`Received order: ${JSON.stringify(order)}`);
    const instanceId = await workflowClient.scheduleNewWorkflow(externalEventsWorkflow, order, order.id);
    res.status(202).json({ instance_id: instanceId });
  } catch (error) {
    next(error);
  }
});

// Listen before the workflow runtime connects, so the Dapr sidecar finds the app port.
const server = app.listen(5258, () => {
  console.log("Listening on port 5258");
});

async function stop() {
  server.close();
  await workflowRuntime.stop();
  await workflowClient.stop();
}

process.once("SIGTERM", () => { void stop(); });
process.once("SIGINT", () => { void stop(); });

workflowRuntime.start().then(() => {
  console.log("Workflow runtime started");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
