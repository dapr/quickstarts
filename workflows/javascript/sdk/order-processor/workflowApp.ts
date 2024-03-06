import { DaprWorkflowClient, WorkflowRuntime, DaprClient } from "@dapr/dapr";
import { InventoryItem, OrderPayload } from "./model";
import { notifyActivity, orderProcessingWorkflow, processPaymentActivity, requestApprovalActivity, reserveInventoryActivity, updateInventoryActivity } from "./orderProcessingWorkflow";

async function start() {
  // Update the gRPC client and worker to use a local address and port
  const workflowClient = new DaprWorkflowClient();
  const workflowWorker = new WorkflowRuntime();

  const daprClient = new DaprClient();
  const storeName = "statestore";

  const inventory = new InventoryItem("item1", 100, 100);
  const key = inventory.itemName;

  await daprClient.state.save(storeName, [
    {
      key: key,
      value: inventory,
    }
  ]);

  const order = new OrderPayload("item1", 100, 10);

  workflowWorker
  .registerWorkflow(orderProcessingWorkflow)
  .registerActivity(notifyActivity)
  .registerActivity(reserveInventoryActivity)
  .registerActivity(requestApprovalActivity)
  .registerActivity(processPaymentActivity)
  .registerActivity(updateInventoryActivity);

  // Wrap the worker startup in a try-catch block to handle any errors during startup
  try {
    await workflowWorker.start();
    console.log("Workflow runtime started successfully");
  } catch (error) {
    console.error("Error starting workflow runtime:", error);
  }

  // Schedule a new orchestration
  try {
    const id = await workflowClient.scheduleNewWorkflow(orderProcessingWorkflow, order);
    console.log(`Orchestration scheduled with ID: ${id}`);

    // Wait for orchestration completion
    const state = await workflowClient.waitForWorkflowCompletion(id, undefined, 30);

    console.log(`Orchestration completed! Result: ${state?.serializedOutput}`);
  } catch (error) {
    console.error("Error scheduling or waiting for orchestration:", error);
    throw error;
  }

  await workflowWorker.stop();
  await workflowClient.stop();
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
