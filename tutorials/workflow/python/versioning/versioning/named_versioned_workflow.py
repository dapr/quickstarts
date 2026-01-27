import dapr.ext.workflow as wf

from runtime import wf_runtime

@wf_runtime.versioned_workflow(name='named_versioned_workflow', is_latest=False)
def named_versioned_workflow(ctx: wf.DaprWorkflowContext, wf_input: str):
    result = yield ctx.call_activity(named_versioned_activity_1, input=wf_input)
    return result

@wf_runtime.versioned_workflow(name='named_versioned_workflow', is_latest=True)
def named_versioned_workflow_fixed(ctx: wf.DaprWorkflowContext, wf_input: str):
    result = yield ctx.call_activity(named_versioned_activity_2, input=wf_input)
    return result

@wf_runtime.activity
def named_versioned_activity_1(ctx: wf.WorkflowActivityContext, act_input: str) -> str:
    print(f'named_versioned_activity_1: Received input: {act_input}.', flush=True)
    return f"{act_input} is"

@wf_runtime.activity
def named_versioned_activity_2(ctx: wf.WorkflowActivityContext, act_input: str) -> str:
    print(f'named_versioned_activity_2: Received input: {act_input}.', flush=True)
    return f"{act_input} task"
