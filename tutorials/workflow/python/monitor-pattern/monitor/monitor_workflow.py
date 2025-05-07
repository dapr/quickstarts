
from dataclasses import dataclass
from datetime import timedelta
import random
import dapr.ext.workflow as wf

wf_runtime = wf.WorkflowRuntime()

@dataclass
class Status:
    isReady: bool

@wf_runtime.workflow(name='monitor_workflow')
def monitor_workflow(ctx: wf.DaprWorkflowContext, counter: int):
    status = yield ctx.call_activity(check_status, input=counter)

    if not status.isReady:
        yield ctx.create_timer(fire_at=timedelta(seconds=2))
        counter += 1
        yield ctx.continue_as_new(counter)

    return f"Status is healthy after {counter} times."

@wf_runtime.activity(name='check_status')
def check_status(ctx: wf.WorkflowActivityContext, act_input: int) -> Status:
    print(f'check_status: Received input: {act_input}.')
    isReady = True if random.randint(0, act_input) > 1 else False
    return Status(isReady=isReady)