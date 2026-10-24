import { DaprWorkflowClient } from "@dapr/dapr";
import { createWorkflowRuntime, runOrder } from "./orderProcessor";
import { daprClient } from "./orderProcessingWorkflow";

async function start() {
  const workflowWorker = createWorkflowRuntime();
  const workflowClient = new DaprWorkflowClient();
  const stopWaiting = new AbortController();
  // Ctrl+C stops the wait. The workflow keeps its state in Dapr.
  const onSignal = () => stopWaiting.abort();
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);
  try {
    await workflowWorker.start();
    console.log("Workflow runtime started successfully");
    await runOrder(workflowClient, stopWaiting.signal);
  } catch (error) {
    // Ctrl+C also stops the sidecar, so the wait can end with a gRPC "canceled" error (code 1) before the signal arrives.
    const canceled = (error as { code?: number }).code === 1;
    if (!stopWaiting.signal.aborted && !canceled) {
      throw error;
    }
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
