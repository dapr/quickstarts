import dapr.ext.workflow as wf

wf_runtime = wf.WorkflowRuntime()

"""
This is the initial version of the workflow.
Note that the input argument for both activities is the orderItem (string).
"""
@wf_runtime.workflow(name='versioning_workflow_1')
def versioning_workflow_1(ctx: wf.DaprWorkflowContext, order_item: str):
    result_a = yield ctx.call_activity(activity_a, input=order_item)
    result_b = yield ctx.call_activity(activity_b, input=order_item)
    
    return result_a + result_b

@wf_runtime.activity(name='activity_a')
def activity_a(ctx: wf.WorkflowActivityContext, order_item: str) -> int:
    """
    This activity processes the order item and returns an integer result.
    """
    print(f'activity_a: Received input: {order_item}.', flush=True)
    return 10

@wf_runtime.activity(name='activity_b')
def activity_b(ctx: wf.WorkflowActivityContext, order_item: str) -> int:
    """
    This activity processes the order item and returns another integer result.
    """
    print(f'activity_b: Received input: {order_item}.', flush=True)
    return 20

"""
This is the updated version of the workflow.
The input for activity_b has changed from order_item (string) to result_a (int).
If there are in-flight workflow instances that were started with the previous version
of this workflow, these will fail when the new version of the workflow is deployed 
and the workflow name remains the same, since the runtime parameters do not match with the persisted state.
It is recommended to version workflows by creating a new workflow class with a new name:
{workflowname}_1 -> {workflowname}_2
Try to avoid making breaking changes in perpetual workflows (that use the `continue_as_new` method) 
since these are difficult to replace with a new version.
"""
@wf_runtime.workflow(name='versioning_workflow_2')
def versioning_workflow_2(ctx: wf.DaprWorkflowContext, order_item: str):
    result_a = yield ctx.call_activity(activity_a, input=order_item)
    result_b = yield ctx.call_activity(activity_b, input=result_a)
    
    return result_a + result_b

@wf_runtime.activity(name='activity_a')
def activity_a(ctx: wf.WorkflowActivityContext, order_item: str) -> int:
    """
    This activity processes the order item and returns an integer result.
    """
    print(f'activity_a: Received input: {order_item}.', flush=True)
    return 10

@wf_runtime.activity(name='activity_b')
def activity_b(ctx: wf.WorkflowActivityContext, number: int) -> int:
    """
    This activity processes a number and returns another integer result.
    """
    print(f'activity_b: Received input: {number}.', flush=True)
    return number + 10