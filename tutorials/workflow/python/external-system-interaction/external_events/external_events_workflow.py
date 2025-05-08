from dataclasses import dataclass
from datetime import timedelta
import dapr.ext.workflow as wf

wf_runtime = wf.WorkflowRuntime()

@dataclass
class ApprovalStatus:
    order_id: str
    is_approved: bool
    
    @staticmethod
    def from_dict(dict):
        return ApprovalStatus(**dict)

@dataclass
class Order:
    id: str
    description: str
    quantity: int
    total_price: float

@wf_runtime.workflow(name='external_events_workflow')
def external_events_workflow(ctx: wf.DaprWorkflowContext, order: Order):
    approval_status = ApprovalStatus(order.id, True)

    if order.total_price > 250:
        yield ctx.call_activity(request_approval, input=order)
        approval_status_task = ctx.wait_for_external_event(name='approval-event')
        timeout_task = ctx.create_timer(fire_at=timedelta(minutes=2))
        winner = yield wf.when_any([approval_status_task, timeout_task])

        if winner == timeout_task:
            notification_message = f"Approval request for order {order.id} timed out."
            yield ctx.call_activity(send_notification, input=order)
            return notification_message

        approval_status = ApprovalStatus.from_dict(approval_status_task.get_result())

    if approval_status.is_approved:
        yield ctx.call_activity(process_order, input=order)
        
    notification_message = f"Order {order.id} has been approved." if approval_status.is_approved else f"Order {order.id} has been rejected."
    yield ctx.call_activity(send_notification, input=notification_message)

    return notification_message

@wf_runtime.activity(name='request_approval')
def request_approval(ctx: wf.WorkflowActivityContext, order: Order) -> None:
    print(f'request_approval: Request approval for order: {order.id}.', flush=True)
    # Imagine an approval request being sent to another system

@wf_runtime.activity(name='send_notification')
def send_notification(ctx: wf.WorkflowActivityContext, message: str) -> None:
    print(f'send_notification: {message}.', flush=True)
    # Imagine a notification being sent to the user

@wf_runtime.activity(name='process_order')
def process_order(ctx: wf.WorkflowActivityContext, order: Order) -> None:
    print(f'process_order: Processed order: {order.id}.', flush=True)
    # Imagine the order being processed by another system