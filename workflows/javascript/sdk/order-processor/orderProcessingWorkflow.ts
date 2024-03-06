import { WorkflowActivityContext, WorkflowContext, TWorkflow, DaprClient } from "@dapr/dapr";
import { InventoryItem, InventoryRequest, InventoryResult, OrderNotification, OrderPayload, OrderPaymentRequest } from "./model";

const daprClient = new DaprClient();
const storeName = "statestore";

// Defines Notify Activity. This is used by the workflow to send out a notification
export const notifyActivity = async (_: WorkflowActivityContext, orderNotification: OrderNotification) => {
  console.log(orderNotification.message);
  return;
};

//Defines Reserve Inventory Activity. This is used by the workflow to verify if inventory is available for the order
export const reserveInventoryActivity = async (_: WorkflowActivityContext, inventoryRequest: InventoryRequest) => {
  console.log(`Reserving inventory for ${inventoryRequest.requestId} of ${inventoryRequest.quantity} ${inventoryRequest.itemName}`);
  const result = await daprClient.state.get(storeName, inventoryRequest.itemName);
  if (result == undefined || result == null) {
    return new InventoryResult(false, undefined);
  }
  const inventoryItem = result as InventoryItem;
  console.log(`There are ${inventoryItem.quantity} ${inventoryItem.itemName} in stock`);

  if (inventoryItem.quantity >= inventoryRequest.quantity) {
    return new InventoryResult(true, inventoryItem)
  }
  return new InventoryResult(false, undefined);
}

export const requestApprovalActivity = async (_: WorkflowActivityContext, orderPayLoad: OrderPayload) => {
  console.log(`Requesting approval for order ${orderPayLoad.itemName}`);
  return true;
}

export const processPaymentActivity = async (_: WorkflowActivityContext, orderPaymentRequest: OrderPaymentRequest) => {
  console.log(`Processing payment for order ${orderPaymentRequest.itemBeingPurchased}`);
  console.log(`Payment of ${orderPaymentRequest.amount} for ${orderPaymentRequest.quantity} ${orderPaymentRequest.itemBeingPurchased} processed successfully`);
  return true;
}

export const updateInventoryActivity = async (_: WorkflowActivityContext, inventoryRequest: InventoryRequest) => {
  console.log(`Updating inventory for ${inventoryRequest.requestId} of ${inventoryRequest.quantity} ${inventoryRequest.itemName}`);
  const result = await daprClient.state.get(storeName, inventoryRequest.itemName);
  if (result == undefined || result == null) {
    return new InventoryResult(false, undefined);
  }
  const inventoryItem = result as InventoryItem;
  inventoryItem.quantity = inventoryItem.quantity - inventoryRequest.quantity;
  if (inventoryItem.quantity < 0) {
    console.log(`Insufficient inventory for ${inventoryRequest.requestId} of ${inventoryRequest.quantity} ${inventoryRequest.itemName}`);
    return new InventoryResult(false, undefined);
  }
  await daprClient.state.save(storeName, [
    {
      key: inventoryRequest.itemName,
      value: inventoryItem,
    }
  ]);
  console.log(`Inventory updated for ${inventoryRequest.requestId}, there are now ${inventoryItem.quantity} ${inventoryItem.itemName} in stock`);
  return new InventoryResult(true, inventoryItem);
}

export const orderProcessingWorkflow: TWorkflow = async function* (ctx: WorkflowContext, orderPayLoad: OrderPayload): any {
  const orderId = ctx.getWorkflowInstanceId();
  console.log(`Processing order ${orderId}...`);

  const orderNotification: OrderNotification = {
    message: `Received order ${orderId} for ${orderPayLoad.quantity} ${orderPayLoad.itemName} at a total cost of ${orderPayLoad.totalCost}`,
  };
  yield ctx.callActivity(notifyActivity, orderNotification);

  const inventoryRequest = new InventoryRequest(orderId, orderPayLoad.itemName, orderPayLoad.quantity);
  const inventoryResult = yield ctx.callActivity(reserveInventoryActivity, inventoryRequest);

  if (!inventoryResult.success) {
    const orderNotification: OrderNotification = {
      message: `Insufficient inventory for order ${orderId}`,
    };
    yield ctx.callActivity(notifyActivity, orderNotification);
    return;
  }

  if (orderPayLoad.totalCost > 5000) {
    const approvalResult = yield ctx.callActivity(requestApprovalActivity, orderPayLoad);
    if (!approvalResult) {
      const orderNotification: OrderNotification = {
        message: `Order ${orderId} approval denied`,
      };
      yield ctx.callActivity(notifyActivity, orderNotification);
      return;
    }
  }

  const orderPaymentRequest = new OrderPaymentRequest(orderId, orderPayLoad.itemName, orderPayLoad.totalCost, orderPayLoad.quantity);
  const paymentResult = yield ctx.callActivity(processPaymentActivity, orderPaymentRequest);

  if (!paymentResult) {
    const orderNotification: OrderNotification = {
      message: `Payment for order ${orderId} failed`,
    };
    yield ctx.callActivity(notifyActivity, orderNotification);
    return;
  }

  const updatedResult = yield ctx.callActivity(updateInventoryActivity, inventoryRequest);
  if (!updatedResult.success) {
    const orderNotification: OrderNotification = {
      message: `Failed to update inventory for order ${orderId}`,
    };
    yield ctx.callActivity(notifyActivity, orderNotification);
    return;
  }

  const orderCompletedNotification: OrderNotification = {
    message: `order ${orderId} processed successfully!`,
  };
  yield ctx.callActivity(notifyActivity, orderCompletedNotification);

  console.log(`Order ${orderId} processed successfully!`);
}
