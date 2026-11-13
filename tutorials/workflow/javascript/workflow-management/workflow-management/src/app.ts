import { DaprWorkflowClient, WorkflowRuntime, WorkflowRuntimeStatus } from "@dapr/dapr";
import express from "express";
import { neverEndingWorkflow, sendNotification } from "./neverEndingWorkflow";

function createWorkflowRuntime(): WorkflowRuntime {
  return new WorkflowRuntime()
    .registerWorkflow(neverEndingWorkflow)
    .registerActivity(sendNotification);
}

const app = express();

/*
 * The DaprWorkflowClient is the API to manage workflows.
 * The endpoints below use it to schedule, get, suspend, resume, terminate and purge a workflow instance.
 */
const workflowClient = new DaprWorkflowClient();

app.post("/start/:counter", async (req, res, next) => {
  try {
    const counter = Number(req.params.counter);
    if (!Number.isInteger(counter)) {
      res.status(400).json({ error: "The counter must be an integer" });
      return;
    }
    const instanceId = await workflowClient.scheduleNewWorkflow(neverEndingWorkflow, counter);
    res.status(202).json({ instance_id: instanceId });
  } catch (error) {
    next(error);
  }
});

app.get("/status/:instanceId", async (req, res, next) => {
  try {
    // The second argument requests the workflow input and output.
    const state = await workflowClient.getWorkflowState(req.params.instanceId, true);
    if (!state) {
      res.status(404).json({ error: "Workflow instance not found" });
      return;
    }
    res.json({
      instance_id: state.instanceId,
      name: state.name,
      runtime_status: WorkflowRuntimeStatus[state.runtimeStatus],
      created_at: state.createdAt,
      last_updated_at: state.lastUpdatedAt,
      serialized_input: state.serializedInput,
      serialized_output: state.serializedOutput,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/suspend/:instanceId", async (req, res, next) => {
  try {
    await workflowClient.suspendWorkflow(req.params.instanceId);
    res.sendStatus(202);
  } catch (error) {
    next(error);
  }
});

app.post("/resume/:instanceId", async (req, res, next) => {
  try {
    await workflowClient.resumeWorkflow(req.params.instanceId);
    res.sendStatus(202);
  } catch (error) {
    next(error);
  }
});

app.post("/terminate/:instanceId", async (req, res, next) => {
  try {
    await workflowClient.terminateWorkflow(req.params.instanceId);
    res.sendStatus(202);
  } catch (error) {
    next(error);
  }
});

app.delete("/purge/:instanceId", async (req, res, next) => {
  try {
    await workflowClient.purgeWorkflow(req.params.instanceId);
    res.sendStatus(202);
  } catch (error) {
    next(error);
  }
});

// Listen before the workflow runtime connects, so the Dapr sidecar finds the app port.
const server = app.listen(5262, () => {
  console.log("Listening on port 5262");
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
