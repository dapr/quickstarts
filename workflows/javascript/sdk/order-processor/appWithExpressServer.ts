import { DaprWorkflowClient, WorkflowRuntime, DaprClient } from "@dapr/dapr";
import { InventoryItem, OrderPayload } from "./model";
import { notifyActivity, orderProcessingWorkflow, processPaymentActivity, requestApprovalActivity, verifyInventoryActivity, updateInventoryActivity } from "./orderProcessingWorkflow";
import express from "express";

const app = express();

const daprClient = new DaprClient();
const workflowClient = new DaprWorkflowClient();
const workflowWorker = new WorkflowRuntime();

app.post("/start-workflow", async (req, res) => {

  const storeName = "statestore";
  const inventory = new InventoryItem("car", 5000, 10);
  const key = inventory.itemName;

  await daprClient.state.save(storeName, [
    {
      key: key,
      value: inventory,
    }
  ]);

  const order = new OrderPayload("car", 5000, 1);

  // Schedule a new orchestration
  try {
    const id = await workflowClient.scheduleNewWorkflow(orderProcessingWorkflow, order);
    console.log(`Orchestration scheduled with ID: ${id}`);

    // Wait for orchestration completion
    const state = await workflowClient.waitForWorkflowCompletion(id, undefined, 30);

    var orchestrationResult = `Orchestration completed! Result: ${state?.serializedOutput}`;
    console.log(orchestrationResult);
  } catch (error) {
    console.error("Error scheduling or waiting for orchestration:", error);
    throw error;
  }

  res.send(orchestrationResult);
});

async function start() {
  workflowWorker
    .registerWorkflow(orderProcessingWorkflow)
    .registerActivity(notifyActivity)
    .registerActivity(verifyInventoryActivity)
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
};

const server = app.listen(process.env.APP_PORT || 3000, () => {
  console.log(`Example app listening on port APP_PORT or 3000`);
})

process.on('SIGTERM', () => {
  workflowWorker.stop();
  server.close();
})

start().catch((e) => {
  workflowWorker.stop();
  console.error(e);
  process.exit(1);
});