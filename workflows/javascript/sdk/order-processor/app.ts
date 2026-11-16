import { DaprWorkflowClient } from "@dapr/dapr";
import { createWorkflowRuntime, processOrder } from "./orderProcessor";
import { daprClient } from "./orderProcessingWorkflow";

async function start() {
  const workflowWorker = createWorkflowRuntime();
  const workflowClient = new DaprWorkflowClient();
  try {
    await workflowWorker.start();
    console.log("Workflow runtime started successfully");
    await processOrder(workflowClient);
  } finally {
    await workflowWorker.stop();
    await workflowClient.stop();
    await daprClient.stop();
  }
}

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
