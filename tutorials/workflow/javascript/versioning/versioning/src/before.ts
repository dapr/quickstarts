import { Task, WorkflowActivityContext, WorkflowContext, WorkflowRuntime } from "@dapr/dapr";
import { startApp } from "./app";

/*
 * The original workflow. It sends an email to notify a user.
 * A workflow definition is a generator function. Each `yield` waits for the result of a task.
 * Workflow code must be deterministic.
 */
export function* notifyUser(ctx: WorkflowContext, input: string): Generator<Task<unknown>, string, any> {
  const result: string = yield ctx.callActivity(sendEmail, input);
  return result;
}

export async function sendEmail(_ctx: WorkflowActivityContext, input: string): Promise<string> {
  console.log(`send_email: Received input: ${input}.`);
  return `Sent email to ${input}`;
}

startApp(notifyUser, () =>
  new WorkflowRuntime().registerWorkflow(notifyUser).registerActivity(sendEmail),
);
