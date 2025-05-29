import dapr.ext.workflow as wf

wf_runtime = wf.WorkflowRuntime()

@wf_runtime.workflow(name='chaining_workflow')
def chaining_workflow(ctx: wf.DaprWorkflowContext, wf_input: str):
    result1 = yield ctx.call_activity(activity1, input=wf_input)
    result2 = yield ctx.call_activity(activity2, input=result1)
    wf_result = yield ctx.call_activity(activity3, input=result2)
    return wf_result

@wf_runtime.activity(name='activity1')
def activity1(ctx: wf.WorkflowActivityContext, act_input: str) -> str:
    print(f'activity1: Received input: {act_input}.', flush=True)
    return f"{act_input} is"

@wf_runtime.activity(name='activity2')
def activity2(ctx: wf.WorkflowActivityContext, act_input: str) -> str:
    print(f'activity2: Received input: {act_input}.', flush=True)
    return f"{act_input} task"

@wf_runtime.activity(name='activity3')
def activity3(ctx: wf.WorkflowActivityContext, act_input: str) -> str:
    print(f'activity3: Received input: {act_input}.', flush=True)
    return f"{act_input} chaining"