import { DaprWorkflowClient } from "@dapr/dapr";
import express from "express";
import { createWorkflowRuntime, processOrder } from "./orderProcessor";
import { daprClient } from "./orderProcessingWorkflow";

const app = express();
const workflowClient = new DaprWorkflowClient();
const workflowWorker = createWorkflowRuntime();

app.post("/start-workflow", async (_req, res, next) => {
  try {
    if (!workflowWorker.isReady) {
      res.status(503).send("Workflow runtime is not ready");
      return;
    }
    res.send(await processOrder(workflowClient));
  } catch (error) {
    next(error);
  }
});

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Order processing failed:", error);
  res.status(500).send("Order processing failed");
});

// Listen before connecting the worker so the sidecar's app-health check can succeed.
const server = app.listen(process.env.APP_PORT || 3000, () => {
  console.log("Order processor listening");
});

async function stop() {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await workflowWorker.stop();
  await workflowClient.stop();
  await daprClient.stop();
}

function fail(error: unknown) {
  console.error(error);
  process.exitCode = 1;
}

process.once("SIGTERM", () => { void stop().catch(fail); });
process.once("SIGINT", () => { void stop().catch(fail); });

workflowWorker.start().then(() => {
  console.log("Workflow runtime started successfully");
}).catch(async (error) => {
  fail(error);
  await stop();
}).catch(fail);
