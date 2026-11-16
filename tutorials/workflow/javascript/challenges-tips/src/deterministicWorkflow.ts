import { randomUUID } from "node:crypto";
import { Task, WorkflowContext } from "@dapr/dapr";
import { createOrderId, submitDate, submitId } from "./activities";

export function* nonDeterministicWorkflow(ctx: WorkflowContext, _input: string): Generator<Task<unknown>, string, any> {
  /*
   * Do not use non-deterministic operations in a workflow!
   * These operations will create a new value every time the
   * workflow is replayed.
   */
  const orderId: string = randomUUID();
  const orderDate: Date = new Date();
  yield ctx.callActivity(submitId, orderId);
  yield ctx.callActivity(submitDate, orderDate);

  return orderId;
}

export function* deterministicWorkflow(ctx: WorkflowContext, input: string): Generator<Task<unknown>, string, any> {
  /*
   * Either wrap non-deterministic operations in an activity. Or use deterministic
   * alternatives on the WorkflowContext instead. These operations create the
   * same value when the workflow is replayed.
   */
  const orderId: string = yield ctx.callActivity(createOrderId, input);
  const orderDate: Date = ctx.getCurrentUtcDateTime();
  yield ctx.callActivity(submitId, orderId);
  yield ctx.callActivity(submitDate, orderDate);

  return orderId;
}
