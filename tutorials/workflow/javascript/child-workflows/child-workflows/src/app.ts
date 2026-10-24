import { DaprWorkflowClient, WorkflowRuntime } from "@dapr/dapr";
import express from "express";
import { activity1, activity2, childWorkflow, parentWorkflow } from "./parentChildWorkflow";

const workflowRuntime = new WorkflowRuntime()
  .registerWorkflow(parentWorkflow)
  .registerWorkflow(childWorkflow)
  .registerActivity(activity1)
  .registerActivity(activity2);

const app = express();
app.use(express.json());

/*
 * The DaprWorkflowClient is the API to manage workflows.
 * Here it is used to schedule a new workflow instance.
 */
const workflowClient = new DaprWorkflowClient();

app.post("/start", async (req, res, next) => {
  try {
    const instanceId = await workflowClient.scheduleNewWorkflow(parentWorkflow, req.body as string[]);
    res.status(202).json({ instance_id: instanceId });
  } catch (error) {
    next(error);
  }
});

// Listen before the workflow runtime connects, so the Dapr sidecar finds the app port.
const server = app.listen(5259, () => {
  console.log("Listening on port 5259");
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
