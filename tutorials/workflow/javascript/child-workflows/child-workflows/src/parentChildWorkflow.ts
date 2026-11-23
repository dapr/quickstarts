import { Task, WorkflowActivityContext, WorkflowContext } from "@dapr/dapr";

/*
 * The parent workflow schedules one child workflow for each item in the input, without waiting for the result of each one.
 * The child workflows run at the same time. `ctx.whenAll` creates a task that completes when all of those tasks are completed.
 *
 * Workflow code must be deterministic. Any non-deterministic behavior should be written inside activities.
 */
export function* parentWorkflow(ctx: WorkflowContext, items: string[]): Generator<Task<any>, string[], any> {
  const childWorkflowTasks = items.map((item) => ctx.callChildWorkflow(childWorkflow, item));
  const result: string[] = yield ctx.whenAll(childWorkflowTasks);
  return result;
}

/*
 * The child workflow is a basic task-chaining workflow: the result of `activity1` is the input of `activity2`.
 * Dapr uses the function name as the workflow name.
 */
export function* childWorkflow(ctx: WorkflowContext, input: string): Generator<Task<any>, string, any> {
  const result1: string = yield ctx.callActivity(activity1, input);
  const result2: string = yield ctx.callActivity(activity2, result1);
  return result2;
}

/*
 * Dapr uses the function name as the activity name.
 */
export async function activity1(_ctx: WorkflowActivityContext, input: string): Promise<string> {
  console.log(`activity1: Received input: ${input}.`);
  return `${input} is processed`;
}

export async function activity2(_ctx: WorkflowActivityContext, input: string): Promise<string> {
  console.log(`activity2: Received input: ${input}.`);
  return `${input} as a child workflow.`;
}
