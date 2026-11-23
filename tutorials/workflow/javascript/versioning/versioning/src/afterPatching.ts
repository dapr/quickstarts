import { Task, WorkflowActivityContext, WorkflowContext, WorkflowRuntime } from "@dapr/dapr";
import { startApp } from "./app";

/*
 * The updated workflow. It uses a patch to change the code without breaking in-flight instances.
 *
 * `ctx.isPatched("sendSms")` returns true for new instances, and for instances that already
 * recorded this patch. It returns false for an instance that started before the patch and is
 * replaying its history. That instance keeps the original code path (`sendEmail`).
 * Keep the original code path until all the instances that need it have finished.
 */
export function* notifyUser(ctx: WorkflowContext, input: string): Generator<Task<unknown>, string, any> {
  let result: string;
  if (ctx.isPatched("sendSms")) {
    result = yield ctx.callActivity(sendSms, input);
  } else {
    result = yield ctx.callActivity(sendEmail, input);
  }
  return result;
}

export async function sendEmail(_ctx: WorkflowActivityContext, input: string): Promise<string> {
  console.log(`send_email: Received input: ${input}.`);
  return `Sent email to ${input}`;
}

export async function sendSms(_ctx: WorkflowActivityContext, input: string): Promise<string> {
  console.log(`send_sms: Received input: ${input}.`);
  return `Sent SMS to ${input}`;
}

startApp(notifyUser, () =>
  new WorkflowRuntime()
    .registerWorkflow(notifyUser)
    .registerActivity(sendEmail)
    .registerActivity(sendSms),
);
