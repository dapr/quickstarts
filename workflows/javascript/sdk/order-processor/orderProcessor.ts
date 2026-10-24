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

const ORDER_ITEM = "car";
const TERMINAL_WAIT_SECONDS = 15 * 60;
const IN_PROGRESS = [WorkflowRuntimeStatus.RUNNING, WorkflowRuntimeStatus.PENDING, WorkflowRuntimeStatus.SUSPENDED];

function defaultOrderId(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `order-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// Starts the order, or attaches to it when the order id already has an instance, and waits for it to end.
export async function runOrder(workflowClient: DaprWorkflowClient, signal?: AbortSignal): Promise<void> {
  const orderId = process.env.ORDER_ID || defaultOrderId();
  console.log(`Order ID: ${orderId}`);

  // Seed the inventory only when it is absent, so a restart does not restock.
  const stock = await daprClient.state.get(storeName, ORDER_ITEM);
  if (stock == null || stock === "") {
    const inventory = new InventoryItem(ORDER_ITEM, 5000, 10);
    await daprClient.state.save(storeName, [{ key: inventory.itemName, value: inventory }]);
  }

  const existing = await workflowClient.getWorkflowState(orderId, false);
  if (existing && !IN_PROGRESS.includes(existing.runtimeStatus)) {
    console.log(`Workflow completed: ${WorkflowRuntimeStatus[existing.runtimeStatus]}`);
    return;
  }
  if (existing) {
    console.log(`Order ${orderId} is already running. Waiting for it to finish.`);
  } else {
    // 2 cars at 5000 each: the total is over 5000, so the order waits for approval.
    await workflowClient.scheduleNewWorkflow(orderProcessingWorkflow, new OrderPayload(ORDER_ITEM, 10000, 2), orderId);
    console.log(`Started order ${orderId}.`);
  }

  const completed = await workflowClient.waitForWorkflowCompletion(orderId, true, TERMINAL_WAIT_SECONDS, signal);
  if (!completed) {
    throw new Error(`Order ${orderId} did not finish within ${TERMINAL_WAIT_SECONDS} seconds`);
  }
  console.log(`Workflow completed: ${WorkflowRuntimeStatus[completed.runtimeStatus]}`);
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
