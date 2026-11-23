import { Task, WorkflowActivityContext, WorkflowContext } from "@dapr/dapr";

/*
 * Workflows orchestrate activities and other (child) workflows, and include business logic (if/else or switch statements).
 * Workflow code must be deterministic. Any non-deterministic behavior should be written inside activities.
 *
 * A workflow definition is a generator function. Each `yield` waits for the result of a task.
 * The first argument (`ctx`) is the `WorkflowContext`. It contains properties
 * about the workflow instance, and methods to call activities.
 * The second argument (`input`) is the input to the workflow. It can be a simple or complex type.
 */
export function* basicWorkflow(ctx: WorkflowContext, input: string): Generator<Task<unknown>, string, any> {
  const result1: string = yield ctx.callActivity(activity1, input);
  const result2: string = yield ctx.callActivity(activity2, result1);
  return result2;
}

/*
 * Activity code typically performs one specific task, like calling an API to store or retrieve data.
 * You can use other Dapr APIs inside an activity.
 *
 * An activity definition is a function. Dapr uses the function name as the activity name.
 * The first argument (`ctx`) is the `WorkflowActivityContext`.
 * The second argument (`input`) is the input parameter for the activity.
 * There can only be one input parameter. Use an object if multiple input values are required.
 */
export async function activity1(_ctx: WorkflowActivityContext, input: string): Promise<string> {
  console.log(`activity1: Received input: ${input}.`);
  return `${input} Two`;
}

export async function activity2(_ctx: WorkflowActivityContext, input: string): Promise<string> {
  console.log(`activity2: Received input: ${input}.`);
  return `${input} Three`;
}
