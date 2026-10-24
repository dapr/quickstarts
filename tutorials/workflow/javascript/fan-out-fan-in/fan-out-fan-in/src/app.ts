import { DaprWorkflowClient, WorkflowRuntime } from "@dapr/dapr";
import express from "express";
import { fanoutfaninWorkflow, getWordLength } from "./fanoutfaninWorkflow";

const workflowRuntime = new WorkflowRuntime()
  .registerWorkflow(fanoutfaninWorkflow)
  .registerActivity(getWordLength);

const app = express();
app.use(express.json());

/*
 * The DaprWorkflowClient is the API to manage workflows.
 * Here it is used to schedule a new workflow instance.
 */
const workflowClient = new DaprWorkflowClient();

app.post("/start", async (req, res, next) => {
  try {
    const instanceId = await workflowClient.scheduleNewWorkflow(fanoutfaninWorkflow, req.body);
    res.status(202).json({ instance_id: instanceId });
  } catch (error) {
    next(error);
  }
});

// Listen before the workflow runtime connects, so the Dapr sidecar finds the app port.
const server = app.listen(5256, () => {
  console.log("Listening on port 5256");
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
