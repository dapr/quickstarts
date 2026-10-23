from datetime import timedelta
import dapr.ext.workflow as wf

wf_runtime = wf.WorkflowRuntime()

@wf_runtime.workflow(name='never_ending_workflow')
def never_ending_workflow(ctx: wf.DaprWorkflowContext, counter: int):
    yield ctx.call_activity(send_notification, input=counter)
    yield ctx.create_timer(fire_at=timedelta(seconds=2))
    counter += 1
    yield ctx.continue_as_new(counter)

    return True

@wf_runtime.activity(name='send_notification')
def send_notification(ctx: wf.WorkflowActivityContext, counter: int) -> None:
    print(f'send_notification: Received input: {counter}.', flush=True)
    # Imagine that a notification is sent to the user here.