from datetime import timedelta
import dapr.ext.workflow as wf

wf_runtime = wf.WorkflowRuntime()

@wf_runtime.workflow(name='resiliency_and_compensation_workflow')
def resiliency_and_compensation_workflow(ctx: wf.DaprWorkflowContext, wf_input: int):
    default_retry_policy = wf.RetryPolicy(max_number_of_attempts=3, first_retry_interval=timedelta(seconds=2))

    result1 = yield ctx.call_activity(minus_one, input=wf_input, retry_policy=default_retry_policy)
    wf_result = None

    try:
        wf_result = yield ctx.call_activity(division, input=result1, retry_policy=default_retry_policy)
    except Exception as e:
        """
        Something went wrong in the division activity which is not recoverable.
        Perform a compensation action for the minus_one activity to revert any
        changes made in that activity.
        """
        if type(e).__name__ == 'TaskFailedError':
            wf_result = yield ctx.call_activity(plus_one, input=result1)

            """
            A custom status message can be set on the workflow instance.
            This can be used to clarify anything that happened during the workflow execution.
            """
            ctx.set_custom_status("Compensated minus_one activity with plus_one activity.")

    return wf_result

@wf_runtime.activity(name='minus_one')
def minus_one(ctx: wf.WorkflowActivityContext, act_input: int) -> int:
    print(f'minus_one: Received input: {act_input}.', flush=True)
    result = act_input - 1
    return result

@wf_runtime.activity(name='division')
def division(ctx: wf.WorkflowActivityContext, act_input: int) -> int:
    """
    In case the divisor is 0 an exception is thrown.
    This exception is handled in the workflow.
    """
    print(f'division: Received input: {act_input}.', flush=True)
    result = int(100/act_input)
    return result

@wf_runtime.activity(name='plus_one')
def plus_one(ctx: wf.WorkflowActivityContext, act_input: int) -> int:
    print(f'plus_one: Received input: {act_input}.', flush=True)
    result = act_input + 1
    return result