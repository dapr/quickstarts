import { DaprClient, HttpMethod, Task, WorkflowActivityContext, WorkflowContext } from "@dapr/dapr";
import * as im from "./inventoryManagement";
import {
  ActivityResult,
  CustomerInfo,
  Order,
  OrderItem,
  OrderStatus,
  ShipmentRegistrationStatus,
  ShippingDestinationResult,
} from "./models";

export const SHIPMENT_REGISTERED_EVENT = "shipment-registered-events";
const DAPR_PUBSUB_COMPONENT = "shippingpubsub";
const DAPR_PUBSUB_REGISTRATION_TOPIC = "shipment-registration-events";

const daprClient = new DaprClient();

/*
 * The event payload can arrive as a JSON object (the shipmentRegistered endpoint, the Dapr HTTP API)
 * or as a JSON string that holds the object (the `dapr workflow raise-event` command).
 * This function accepts both.
 */
function toShipmentRegistrationStatus(payload: unknown): ShipmentRegistrationStatus {
  return (typeof payload === "string" ? JSON.parse(payload) : payload) as ShipmentRegistrationStatus;
}

/*
 * This workflow combines three patterns:
 * - Fan-out/fan-in: two independent activities run at the same time.
 * - Task chaining: the payment, inventory and shipment activities run in sequence.
 * - External event: the workflow waits for the shipping app to confirm the shipment.
 * If the shipment is not registered, a compensation activity reimburses the customer.
 *
 * Workflow code must be deterministic. Use `ctx.createTimer` for delays, never `setTimeout`.
 */
export function* orderWorkflow(ctx: WorkflowContext, order: Order): Generator<Task<any>, OrderStatus, any> {
  if (!ctx.isReplaying()) {
    console.log(`orderWorkflow: Received order id: ${order.id}.`);
  }

  // First, two independent activities are called in parallel (fan-out/fan-in pattern):
  const taskResults: ActivityResult[] = yield ctx.whenAll([
    ctx.callActivity(checkInventory, order.order_item),
    ctx.callActivity(checkShippingDestination, order.customer_info),
  ]);

  const failedResult = taskResults.find((taskResult) => !taskResult.is_success);
  if (failedResult) {
    return { is_success: false, message: `Order processing failed. Reason: ${failedResult.message}` };
  }

  // Two activities are called in sequence (chaining pattern) where the updateInventory
  // activity is dependent on the result of the processPayment activity:
  const paymentResult: ActivityResult = yield ctx.callActivity(processPayment, order);
  if (!ctx.isReplaying()) {
    console.log(`orderWorkflow: Payment result: ${JSON.stringify(paymentResult)}.`);
  }
  if (paymentResult.is_success) {
    yield ctx.callActivity(updateInventory, order.order_item);
  }

  // The registerShipment activity is using pub/sub messaging to communicate with the shipping app.
  yield ctx.callActivity(registerShipment, order);

  // The shipping app will also use pub/sub messaging back to the workflow app and raise an event.
  // The workflow will wait for the event to be received or until the timeout occurs.
  const shipmentRegisteredTask = ctx.waitForExternalEvent(SHIPMENT_REGISTERED_EVENT);
  const timeoutTask = ctx.createTimer(300);
  const winner: Task<unknown> = yield ctx.whenAny([shipmentRegisteredTask, timeoutTask]);
  if (winner === timeoutTask) {
    // Timeout occurred, the shipment-registered-event was not received.
    return { is_success: false, message: `Shipment registration status for ${order.id} timed out.` };
  }

  const shipmentRegistrationStatus = toShipmentRegistrationStatus(shipmentRegisteredTask.getResult());
  if (!shipmentRegistrationStatus.is_success) {
    // This is the compensation step in case the shipment registration event was not successful.
    yield ctx.callActivity(reimburseCustomer, order);
    return {
      is_success: false,
      message: `Shipment registration status for ${order.id} failed. Customer is reimbursed.`,
    };
  }
  return { is_success: true, message: `Order ${order.id} processed successfully.` };
}

/*
 * Dapr uses the function name as the activity name.
 */
export async function checkInventory(_ctx: WorkflowActivityContext, orderItem: OrderItem): Promise<ActivityResult> {
  console.log(`checkInventory: Received input: ${JSON.stringify(orderItem)}.`);
  const isAvailable = await im.checkInventory(orderItem);
  return { is_success: isAvailable };
}

/*
 * This activity uses the Dapr service invocation API to call the shipping app.
 */
export async function checkShippingDestination(
  _ctx: WorkflowActivityContext,
  customerInfo: CustomerInfo,
): Promise<ActivityResult> {
  console.log(`checkShippingDestination: Received input: ${JSON.stringify(customerInfo)}.`);
  try {
    const result = (await daprClient.invoker.invoke(
      "shipping",
      "checkDestination",
      HttpMethod.POST,
      customerInfo,
    )) as ShippingDestinationResult;
    return { is_success: result.is_success };
  } catch (error) {
    console.log(`Failed to check the shipping destination. Reason: ${error}.`);
    throw new Error(`Failed to check the shipping destination. Reason: ${error}.`);
  }
}

export async function processPayment(_ctx: WorkflowActivityContext, order: Order): Promise<ActivityResult> {
  console.log(`processPayment: Received input: ${JSON.stringify(order)}.`);
  // Imagine the payment being processed by another system
  return { is_success: true };
}

export async function updateInventory(_ctx: WorkflowActivityContext, orderItem: OrderItem): Promise<ActivityResult> {
  console.log(`updateInventory: Received input: ${JSON.stringify(orderItem)}.`);
  return await im.updateInventory(orderItem);
}

export async function reimburseCustomer(_ctx: WorkflowActivityContext, order: Order): Promise<ActivityResult> {
  console.log(`reimburseCustomer: Received input: ${JSON.stringify(order)}.`);
  // Imagine the customer being reimbursed by another system
  return { is_success: true };
}

/*
 * This activity uses the Dapr pub/sub API to send the order to the shipping app.
 */
export async function registerShipment(_ctx: WorkflowActivityContext, order: Order): Promise<ActivityResult> {
  console.log(`registerShipment: Received input: ${JSON.stringify(order)}.`);
  const result = await daprClient.pubsub.publish(DAPR_PUBSUB_COMPONENT, DAPR_PUBSUB_REGISTRATION_TOPIC, order);
  if (result.error) {
    throw result.error;
  }
  return { is_success: true };
}
