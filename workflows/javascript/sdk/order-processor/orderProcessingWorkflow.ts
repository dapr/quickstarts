import { Task, WorkflowActivityContext, WorkflowContext, DaprClient, LogLevel } from "@dapr/dapr";
import { ApprovalRequest, ApprovalResponse, InventoryItem, InventoryRequest, InventoryResult, OrderNotification, OrderPayload, OrderPaymentRequest, OrderResult } from "./model";

export const daprClient = new DaprClient({ logger: { level: LogLevel.Error } });
export const storeName = "statestore";

async function getInventory(itemName: string): Promise<InventoryItem | undefined> {
  const result = await daprClient.state.get(storeName, itemName);
  if (result == null || result === "") {
    return undefined;
  }
  if (typeof result !== "object" || typeof result.itemName !== "string" ||
      typeof result.perItemCost !== "number" || typeof result.quantity !== "number") {
    throw new Error(`Invalid inventory for ${itemName}`);
  }
  return new InventoryItem(result.itemName, result.perItemCost, result.quantity);
}

export const notifyActivity = async (_: WorkflowActivityContext, notification: OrderNotification) => {
  console.log(notification.message);
};

export const verifyInventoryActivity = async (_: WorkflowActivityContext, request: InventoryRequest) => {
  console.log(`Verifying inventory for ${request.requestId} of ${request.quantity} ${request.itemName}`);
  const inventory = await getInventory(request.itemName);
  if (!inventory) {
    console.log(`No inventory found for ${request.itemName}`);
    return new InventoryResult(false, undefined);
  }
  console.log(`There are ${inventory.quantity} ${inventory.itemName} in stock`);
  return new InventoryResult(inventory.quantity >= request.quantity, inventory);
};

export const requestApprovalActivity = async (_: WorkflowActivityContext, request: ApprovalRequest) => {
  console.log(`Approval requested for order ${request.orderId}. Waiting for approval.`);
};

export const processPaymentActivity = async (_: WorkflowActivityContext, request: OrderPaymentRequest) => {
  console.log(`Payment of ${request.amount} for ${request.quantity} ${request.itemBeingPurchased} processed successfully`);
};

export const updateInventoryActivity = async (_: WorkflowActivityContext, request: InventoryRequest) => {
  const inventory = await getInventory(request.itemName);
  if (!inventory || inventory.quantity < request.quantity) {
    throw new Error(`Insufficient inventory for order ${request.requestId}`);
  }
  inventory.quantity -= request.quantity;
  await daprClient.state.save(storeName, [{ key: request.itemName, value: inventory }]);
  console.log(`Inventory updated for ${request.requestId}, there are now ${inventory.quantity} ${inventory.itemName} in stock`);
};

export function* orderProcessingWorkflow(
  ctx: WorkflowContext,
  order: OrderPayload,
): Generator<Task<unknown>, OrderResult, unknown> {
  const orderId = ctx.getWorkflowInstanceId();

  yield ctx.callActivity(notifyActivity, {
    message: `Received order ${orderId} for ${order.quantity} ${order.itemName} at a total cost of ${order.totalCost}`,
  });

  const inventoryRequest = new InventoryRequest(orderId, order.itemName, order.quantity);
  const inventoryTask = ctx.callActivity<InventoryResult>(verifyInventoryActivity, inventoryRequest);
  yield inventoryTask;

  if (!inventoryTask.getResult().success) {
    yield ctx.callActivity(notifyActivity, { message: `Insufficient inventory for order ${orderId}` });
    return new OrderResult(false);
  }

  if (order.totalCost > 5000) {
    yield ctx.callActivity(requestApprovalActivity, { orderId, order });
    const approvalTask = ctx.waitForExternalEvent<ApprovalResponse>("ApprovalEvent", { timeoutInSeconds: 600 });
    yield approvalTask;
    // The Dapr CLI sends the --input value as a JSON string, so accept a string or an object.
    const reply = approvalTask.getResult();
    const approval = typeof reply === "string" ? JSON.parse(reply) as ApprovalResponse : reply;
    if (!approval?.approved) {
      yield ctx.callActivity(notifyActivity, { message: `Order ${orderId} was not approved` });
      return new OrderResult(false);
    }
  }

  yield ctx.callActivity(processPaymentActivity,
    new OrderPaymentRequest(orderId, order.itemName, order.totalCost, order.quantity));

  const updateTask = ctx.callActivity(updateInventoryActivity, inventoryRequest);
  try {
    yield updateTask;
  } catch (error) {
    // Only compensate an activity failure, not an unrelated workflow error.
    if (!updateTask.isFailed) {
      throw error;
    }
    ctx.logger.error(`Inventory update failed for order ${orderId}`, error);
    yield ctx.callActivity(notifyActivity, { message: `Order ${orderId} failed! You are now getting a refund` });
    return new OrderResult(false);
  }

  yield ctx.callActivity(notifyActivity, { message: `Order ${orderId} processed successfully!` });
  return new OrderResult(true);
}
