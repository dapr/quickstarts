import { Task, WorkflowActivityContext, WorkflowContext } from "@dapr/dapr";

/*
 * This workflow never ends on its own. Each run sends a notification, waits 2 seconds
 * and then restarts itself with the counter plus one (`continueAsNew`).
 * The workflow stays in the `RUNNING` status until the app suspends, terminates or purges it.
 *
 * Workflow code must be deterministic. Any non-deterministic behavior should be written inside activities.
 */
export function* neverEndingWorkflow(ctx: WorkflowContext, counter: number): Generator<Task<unknown>, void, any> {
  yield ctx.callActivity(sendNotification, counter);
  // A number is a duration in seconds.
  yield ctx.createTimer(2);
  ctx.continueAsNew(counter + 1);
}

export async function sendNotification(_ctx: WorkflowActivityContext, counter: number): Promise<void> {
  console.log(`sendNotification: Received input: ${counter}.`);
  // Imagine that a notification is sent to the user here.
}
