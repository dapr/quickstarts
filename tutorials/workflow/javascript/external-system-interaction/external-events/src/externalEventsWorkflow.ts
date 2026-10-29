import { Task, WorkflowActivityContext, WorkflowContext } from "@dapr/dapr";

export interface Order {
  id: string;
  description: string;
  quantity: number;
  total_price: number;
}

export interface ApprovalStatus {
  order_id: string;
  is_approved: boolean;
}

/*
 * The event payload can arrive as a JSON object (the Dapr HTTP API) or as a JSON string that holds
 * the object (the `dapr workflow raise-event` command). This function accepts both.
 */
function toApprovalStatus(payload: unknown): ApprovalStatus {
  return (typeof payload === "string" ? JSON.parse(payload) : payload) as ApprovalStatus;
}

/*
 * This workflow requests an external approval when the order has a total price greater than 250 dollars.
 * It waits for the `approval-event` event for 2 minutes. If no event arrives, it sends a notification and ends.
 *
 * Workflow code must be deterministic. Use `ctx.createTimer` for delays, never `setTimeout`.
 */
export function* externalEventsWorkflow(ctx: WorkflowContext, order: Order): Generator<Task<unknown>, string, any> {
  let approvalStatus: ApprovalStatus = { order_id: order.id, is_approved: true };

  if (order.total_price > 250) {
    yield ctx.callActivity(requestApproval, order);

    const approvalEventTask = ctx.waitForExternalEvent("approval-event");
    const timeoutTask = ctx.createTimer(120);
    const winner: Task<unknown> = yield ctx.whenAny([approvalEventTask, timeoutTask]);

    if (winner === timeoutTask) {
      const timeoutMessage = `Approval request for order ${order.id} timed out.`;
      yield ctx.callActivity(sendNotification, timeoutMessage);
      return timeoutMessage;
    }

    approvalStatus = toApprovalStatus(approvalEventTask.getResult());
  }

  if (approvalStatus.is_approved) {
    yield ctx.callActivity(processOrder, order);
  }

  const notificationMessage = approvalStatus.is_approved
    ? `Order ${order.id} has been approved.`
    : `Order ${order.id} has been rejected.`;
  yield ctx.callActivity(sendNotification, notificationMessage);

  return notificationMessage;
}

/*
 * Dapr uses the function name as the activity name.
 */
export async function requestApproval(_ctx: WorkflowActivityContext, order: Order): Promise<void> {
  console.log(`requestApproval: Request approval for order: ${order.id}.`);
  // Imagine an approval request being sent to another system
}

export async function sendNotification(_ctx: WorkflowActivityContext, message: string): Promise<void> {
  console.log(`sendNotification: ${message}`);
  // Imagine a notification being sent to the user
}

export async function processOrder(_ctx: WorkflowActivityContext, order: Order): Promise<void> {
  console.log(`processOrder: Processed order: ${order.id}.`);
  // Imagine the order being processed by another system
}
