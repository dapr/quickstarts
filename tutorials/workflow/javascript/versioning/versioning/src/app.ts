import { DaprWorkflowClient, TWorkflow, WorkflowRuntime } from "@dapr/dapr";
import express from "express";

/*
 * Starts the HTTP server and the workflow runtime. Each stage file (`before.ts`, `afterPatching.ts`)
 * calls this function with its own workflow and its own runtime registration.
 */
export function startApp(workflow: TWorkflow, createWorkflowRuntime: () => WorkflowRuntime) {
  const app = express();

  /*
   * The DaprWorkflowClient is the API to manage workflows.
   * Here it is used to schedule a new workflow instance.
   */
  const workflowClient = new DaprWorkflowClient();

  app.post("/start", async (req, res, next) => {
    try {
      const instanceId = await workflowClient.scheduleNewWorkflow(workflow, "user_id");
      res.status(202).json({ instance_id: instanceId });
    } catch (error) {
      next(error);
    }
  });

  // Listen before the workflow runtime connects, so the Dapr sidecar finds the app port.
  const server = app.listen(5263, () => {
    console.log("Listening on port 5263");
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
}
