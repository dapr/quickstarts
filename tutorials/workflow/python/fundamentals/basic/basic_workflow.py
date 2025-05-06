
from dapr.ext.workflow import DaprWorkflowContext, WorkflowActivityContext, WorkflowRuntime

wf_runtime = WorkflowRuntime()

@wf_runtime.workflow(name='basic_workflow')
def basic_workflow(ctx: DaprWorkflowContext, wf_input: str):
    result1 = yield ctx.call_activity(activity1, input=wf_input)
    result2 = yield ctx.call_activity(activity2, input=result1)
    
    return result2

@wf_runtime.activity(name='activity1')
def activity1(ctx: WorkflowActivityContext, input):
    print(f'activity1: Received input: {input}.')
    return f"{input} Two"

@wf_runtime.activity(name='activity2')
def activity2(ctx: WorkflowActivityContext, input):
    print(f'activity2: Received input: {input}.')
    return f"{input} Three"