import { DaprWorkflowClient, DaprServer, CommunicationProtocolEnum } from "@dapr/dapr";
import express from "express";
import { createWorkflowRuntime, processOrder } from "./orderProcessor";
import { daprClient } from "./orderProcessingWorkflow";

const app = express();
const daprServer = new DaprServer({
  serverHost: "127.0.0.1",
  serverPort: process.env.APP_PORT || "3000",
  serverHttp: app,
  communicationProtocol: CommunicationProtocolEnum.HTTP,
});
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

async function start() {
  await daprServer.start();
  await workflowWorker.start();
  console.log("Workflow runtime started successfully");
}

async function stop() {
  await daprServer.stop();
  await workflowWorker.stop();
  await workflowClient.stop();
  await daprClient.stop();
  await daprServer.client.stop();
}

function fail(error: unknown) {
  console.error(error);
  process.exitCode = 1;
}

process.once("SIGTERM", () => { void stop().catch(fail); });
process.once("SIGINT", () => { void stop().catch(fail); });

start().catch(async (error) => {
  fail(error);
  await stop();
}).catch(fail);
