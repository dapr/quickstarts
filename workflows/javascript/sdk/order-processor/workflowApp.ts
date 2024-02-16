import { DaprWorkflowClient, WorkflowRuntime, DaprClient } from "@dapr/dapr-dev";
import { InventoryItem, OrderPayload } from "./model";
import { notifyActivity, orderProcessingWorkflow, processPaymentActivity, requestApprovalActivity, reserveInventoryActivity, updateInventoryActivity } from "./orderProcessingWorkflow";

async function start() {
  // Update the gRPC client and worker to use a local address and port
  const daprHost = "localhost";
  const daprPort = "50001";
  const workflowClient = new DaprWorkflowClient({
    daprHost,
    daprPort,
  });
  const workflowRuntime = new WorkflowRuntime({
    daprHost,
    daprPort,
  });

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

  workflowRuntime
  .registerWorkflow(orderProcessingWorkflow)
  .registerActivity(notifyActivity)
  .registerActivity(reserveInventoryActivity)
  .registerActivity(requestApprovalActivity)
  .registerActivity(processPaymentActivity)
  .registerActivity(updateInventoryActivity);

  // Wrap the worker startup in a try-catch block to handle any errors during startup
  try {
    await workflowRuntime.start();
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
  }

  await workflowRuntime.stop();
  await workflowClient.stop();

  // stop the dapr side car
  process.exit(0);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
