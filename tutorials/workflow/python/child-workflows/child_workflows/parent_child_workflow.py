from typing import List
import dapr.ext.workflow as wf

wf_runtime = wf.WorkflowRuntime()

@wf_runtime.workflow(name='parent_workflow')
def parent_workflow(ctx: wf.DaprWorkflowContext, items: List[str]):
    
    child_wf_tasks = [
        ctx.call_child_workflow(child_workflow, input=item) for item in items
    ]
    wf_result = yield wf.when_all(child_wf_tasks)

    return wf_result

@wf_runtime.workflow(name='child_workflow')
def child_workflow(ctx: wf.DaprWorkflowContext, wf_input: str):
    result1 = yield ctx.call_activity(activity1, input=wf_input)
    wf_result = yield ctx.call_activity(activity2, input=result1)
    return wf_result

@wf_runtime.activity(name='activity1')
def activity1(ctx: wf.WorkflowActivityContext, act_input: str) -> str:
    print(f'activity1: Received input: {act_input}.', flush=True)
    return f"{act_input} is processed"

@wf_runtime.activity(name='activity2')
def activity2(ctx: wf.WorkflowActivityContext, act_input: str) -> str:
    print(f'activity2: Received input: {act_input}.', flush=True)
    return f"{act_input} as a child workflow."