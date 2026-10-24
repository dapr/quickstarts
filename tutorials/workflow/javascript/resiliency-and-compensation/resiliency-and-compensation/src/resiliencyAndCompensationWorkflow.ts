import { RetryPolicy, Task, WorkflowActivityContext, WorkflowContext } from "@dapr/dapr";

/*
 * The retry policy applies to every activity that is called with it. Time intervals are in seconds.
 * `maxNumberOfAttempts` includes the first call, so a failing activity runs 3 times in total.
 */
const defaultRetryPolicy: RetryPolicy = {
  maxNumberOfAttempts: 3,
  firstRetryInterval: 2,
};

/*
 * This workflow retries the `division` activity when it fails. If all attempts fail,
 * it runs the compensation activity `plusOne` to revert the change made by `minusOne`.
 *
 * Workflow code must be deterministic. Any non-deterministic behavior should be written inside activities.
 */
export function* resiliencyAndCompensationWorkflow(ctx: WorkflowContext, input: number): Generator<Task<unknown>, number | undefined, any> {
  const result1: number = yield ctx.callActivity(minusOne, input, { retryPolicy: defaultRetryPolicy });
  let result: number | undefined;

  try {
    result = yield ctx.callActivity(division, result1, { retryPolicy: defaultRetryPolicy });
  } catch (error) {
    /*
     * Something went wrong in the division activity, and the retries did not fix it.
     * Perform a compensation action for the minusOne activity to revert any
     * changes made in that activity.
     */
    result = yield ctx.callActivity(plusOne, result1);

    /*
     * A custom status message can be set on the workflow instance.
     * This can be used to clarify anything that happened during the workflow execution.
     */
    ctx.setCustomStatus("Compensated minusOne activity with plusOne activity.");
  }

  return result;
}

/*
 * Dapr uses the function name as the activity name.
 */
export async function minusOne(_ctx: WorkflowActivityContext, input: number): Promise<number> {
  console.log(`minusOne: Received input: ${input}.`);
  return input - 1;
}

export async function division(_ctx: WorkflowActivityContext, input: number): Promise<number> {
  /*
   * In case the divisor is 0 an error is thrown.
   * The retry policy of the workflow retries this activity, and the workflow handles the final error.
   */
  console.log(`division: Received input: ${input}.`);
  if (input === 0) {
    throw new Error("Division by zero");
  }
  return Math.trunc(100 / input);
}

export async function plusOne(_ctx: WorkflowActivityContext, input: number): Promise<number> {
  console.log(`plusOne: Received input: ${input}.`);
  return input + 1;
}
