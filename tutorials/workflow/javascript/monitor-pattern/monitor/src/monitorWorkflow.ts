import { Task, WorkflowActivityContext, WorkflowContext } from "@dapr/dapr";

export interface Status {
  isReady: boolean;
}

/*
 * Workflows orchestrate activities and other (child) workflows, and include business logic (if/else or switch statements).
 * Workflow code must be deterministic. Any non-deterministic behavior should be written inside activities.
 *
 * A workflow definition is a generator function. Each `yield` waits for the result of a task.
 * The first argument (`ctx`) is the `WorkflowContext`. It contains properties
 * about the workflow instance, and methods to call activities and to create timers.
 * The second argument (`counter`) is the input to the workflow.
 *
 * This workflow calls the `checkStatus` activity. When the resource is not ready, the workflow waits
 * for a durable timer and then continues as a new instance, with the counter increased by one.
 */
export function* monitorWorkflow(ctx: WorkflowContext, counter: number): Generator<Task<unknown>, string | undefined, any> {
  const status: Status = yield ctx.callActivity(checkStatus, counter);

  if (!status.isReady) {
    // A durable timer: the wait of 2 seconds survives a restart of the app.
    yield ctx.createTimer(2);
    // Restart the workflow with a new input and an empty history. Do not run more workflow code after this call.
    ctx.continueAsNew(counter + 1);
    return;
  }

  return `Status is healthy after ${counter} times.`;
}

/*
 * Activity code typically performs one specific task, like calling an API to store or retrieve data.
 * You can use other Dapr APIs inside an activity.
 *
 * An activity definition is a function. Dapr uses the function name as the activity name.
 * The first argument (`ctx`) is the `WorkflowActivityContext`.
 * The second argument (`input`) is the input parameter for the activity.
 *
 * The random number generator simulates the status of a fictional resource.
 */
export async function checkStatus(_ctx: WorkflowActivityContext, input: number): Promise<Status> {
  console.log(`checkStatus: Received input: ${input}.`);
  const isReady = Math.floor(Math.random() * (input + 1)) > 1;
  return { isReady };
}
