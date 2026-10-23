import { DaprWorkflowClient, WorkflowRuntime, WorkflowRuntimeStatus } from "@dapr/dapr";
import { InventoryItem, OrderPayload, OrderResult } from "./model";
import { daprClient, storeName, notifyActivity, orderProcessingWorkflow, processPaymentActivity, requestApprovalActivity, verifyInventoryActivity, updateInventoryActivity } from "./orderProcessingWorkflow";

export function createWorkflowRuntime(): WorkflowRuntime {
  return new WorkflowRuntime()
    .registerWorkflow(orderProcessingWorkflow)
    .registerActivity(notifyActivity)
    .registerActivity(verifyInventoryActivity)
    .registerActivity(requestApprovalActivity)
    .registerActivity(processPaymentActivity)
    .registerActivity(updateInventoryActivity);
}

export async function processOrder(workflowClient: DaprWorkflowClient): Promise<string> {
  const inventory = new InventoryItem("car", 5000, 10);
  await daprClient.state.save(storeName, [{ key: inventory.itemName, value: inventory }]);

  const order = new OrderPayload("car", 5000, 1);
  const id = await workflowClient.scheduleNewWorkflow(orderProcessingWorkflow, order);
  console.log(`Workflow scheduled with ID: ${id}`);

  const started = await workflowClient.waitForWorkflowStart(id, true, 30);
  if (!started) {
    throw new Error(`Workflow ${id} did not start`);
  }
  const input = started.getInput<OrderPayload>();
  if (input?.itemName !== order.itemName || input.quantity !== order.quantity || input.totalCost !== order.totalCost) {
    throw new Error(`Workflow ${id} input did not match the order`);
  }
  console.log("Workflow started with the expected order");

  const completed = await workflowClient.waitForWorkflowCompletion(id, true, 60);
  if (!completed || completed.runtimeStatus !== WorkflowRuntimeStatus.COMPLETED) {
    throw new Error(`Workflow ${id} did not complete successfully: ${completed?.workflowFailureDetails?.getErrorMessage() ?? completed?.runtimeStatus}`);
  }
  console.log(`Workflow Status: ${WorkflowRuntimeStatus[completed.runtimeStatus]}`);

  const output = completed.getOutput<OrderResult>();
  if (output?.processed !== true) {
    throw new Error(`Order ${id} was not processed`);
  }
  const result = `Workflow result: ${JSON.stringify(output)}`;
  console.log(result);
  return result;
}
