
import dapr.ext.workflow as wf

wf_runtime = wf.WorkflowRuntime()

"""
Workflows orchestrate activities and other (child) workflows, and include business logic (if/else or switch statements).
Workflow code must be be deterministic. Any non-deterministic behavior should be written inside activities.

Workflow definitions use the `workflow` decorator to define a workflow.
The first argument (`ctx`) is the `DaprWorkflowContext`, this contains properties
about the workflow instance, and methods to call activities.
The second argument (`wf_input`) is the input to the workflow. It can be a simple or complex type.
"""
@wf_runtime.workflow(name='basic_workflow')
def basic_workflow(ctx: wf.DaprWorkflowContext, wf_input: str):
    result1 = yield ctx.call_activity(activity1, input=wf_input)
    result2 = yield ctx.call_activity(activity2, input=result1)
    return result2

"""
Activity code typically performs a one specific task, like calling an API to store or retrieve data.
You can use other Dapr APIs inside an activity.

Activity definitions use the `activity` decorator to define an activity.
The first argument (`ctx`) is the `WorkflowActivityContext` and provides 
the name of the activity and the workflow instance.
The second argument (`act_input`) is the input parameter for the activity. 
There can only be one input parameter. Use a class if multiple input values are required.
"""
@wf_runtime.activity(name='activity1')
def activity1(ctx: wf.WorkflowActivityContext, act_input: str) -> str:
    print(f'activity1: Received input: {act_input}.', flush=True)
    return f"{act_input} Two"

@wf_runtime.activity(name='activity2')
def activity2(ctx: wf.WorkflowActivityContext, act_input: str) -> str:
    print(f'activity2: Received input: {act_input}.', flush=True)
    return f"{act_input} Three"