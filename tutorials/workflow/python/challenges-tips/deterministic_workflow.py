import dapr.ext.workflow as wf
import datetime
import uuid

wf_runtime = wf.WorkflowRuntime()

@wf_runtime.workflow(name='non_deterministic_workflow')
def non_deterministic_workflow(ctx: wf.DaprWorkflowContext, wf_input: str):
    
    """
    Do not use non-deterministic operations in a workflow!
    These operations will create a new value every time the
    workflow is replayed.
    """
    order_id = str(uuid.uuid4())
    order_date = datetime.now()
    yield ctx.call_activity(submit_id, input=order_id)
    yield ctx.call_activity(submit_date, input=order_date)
    
    return order_id


@wf_runtime.workflow(name='deterministic_workflow')
def deterministic_workflow(ctx: wf.DaprWorkflowContext, wf_input: str):
    
    """
    Either wrap non-deterministic operations in an activity. Or use deterministic
    alternatives on the DaprWorkflowContext instead. These operations create the 
    same value when the workflow is replayed.
    """
    order_id = yield ctx.call_activity(create_order_id, input=wf_input)
    order_date = ctx.current_utc_datetime
    yield ctx.call_activity(submit_id, input=order_id)
    yield ctx.call_activity(submit_date, input=order_date)

    return order_id
