import dapr.ext.workflow as wf
from runtime import wf_runtime

@wf_runtime.workflow
def patching_workflow(ctx: wf.DaprWorkflowContext, wf_input: str):
    if ctx.is_patched("patch1"):
        result = yield ctx.call_activity(patching_workflow_activity_2, input=wf_input)
    else:
        result = yield ctx.call_activity(patching_workflow_activity_1, input=wf_input)
    return result

@wf_runtime.activity
def patching_workflow_activity_1(ctx: wf.WorkflowActivityContext, act_input: str) -> str:
    print(f'patching_workflow_activity_1: Received input: {act_input}.', flush=True)
    return f"activity1: {act_input}"

@wf_runtime.activity
def patching_workflow_activity_2(ctx: wf.WorkflowActivityContext, act_input: str) -> str:
    print(f'patching_workflow_activity_2: Received input: {act_input}.', flush=True)
    return f"activity2: {act_input}"
