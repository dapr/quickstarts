import { DaprWorkflowClient, WorkflowRuntime } from "@dapr/dapr";
import express from "express";
import { fanoutfaninWorkflow, getWordLength } from "./fanoutfaninWorkflow";

function createWorkflowRuntime(): WorkflowRuntime {
  return new WorkflowRuntime()
    .registerWorkflow(fanoutfaninWorkflow)
    .registerActivity(getWordLength);
}

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
