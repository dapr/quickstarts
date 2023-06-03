
from datetime import timedelta
import logging
import json
from dapr.ext.workflow import DaprWorkflowContext, WorkflowActivityContext, when_any
from model import InventoryItem, Notification, InventoryRequest, OrderPayload, OrderResult,\
    PaymentRequest, InventoryResult
from dapr.clients import DaprClient
from util import get_address

store_name = "statestore-actors"

address = get_address()
logging.basicConfig(level=logging.INFO)


def order_processing_workflow(ctx: DaprWorkflowContext, order_payload: OrderPayload):
    """Defines the order processing workflow.
    When the order is received, the inventory is checked to see if there is enough inventory to
    fulfill the order. If there is enough inventory, the payment is processed and the inventory is
    updated. If there is not enough inventory, the order is rejected.
    If the total order is greater than $50,000, the order is sent to a manager for approval.
    """
    order_id = ctx.instance_id
    yield ctx.call_activity(notify_activity, 
                            input=Notification(message=f'Received order {order_id} for \
                                               {order_payload.quantity} {order_payload.item_name} \
                                               at ${order_payload.total_cost} !'))
    result = yield ctx.call_activity(verify_inventory_activity,
                                     input=InventoryRequest(request_id=order_id,
                                                            item_name=order_payload.item_name,
                                                            quantity=order_payload.quantity))
    if not result.success:
        yield ctx.call_activity(notify_activity,
                                input=Notification(message=f'Insufficient inventory for \
                                                   {order_payload.item_name}!'))
        return OrderResult(processed=False)
    
    if order_payload.total_cost > 50000:
        yield ctx.call_activity(requst_approval_activity, input=order_payload)
        approval_task = ctx.wait_for_external_event("manager_approval")
        timeout_event = ctx.create_timer(timedelta(seconds=200))
        winner = yield when_any([approval_task, timeout_event])
        if winner == timeout_event:
            yield ctx.call_activity(notify_activity, 
                                    input=Notification(message=f'Payment for order {order_id} \
                                                       has been cancelled due to timeout!'))
            return OrderResult(processed=False)
        approval_result = yield approval_task
        if approval_result["approval"]:
            yield ctx.call_activity(notify_activity, input=Notification(
                message=f'Payment for order {order_id} has been approved!'))
        else:
            yield ctx.call_activity(notify_activity, input=Notification(
                message=f'Payment for order {order_id} has been rejected!'))
            return OrderResult(processed=False)    
    
    yield ctx.call_activity(process_payment_activity, input=PaymentRequest(
        request_id=order_id, item_being_purchased=order_payload.item_name,
        amount=order_payload.total_cost, quantity=order_payload.quantity))

    try:
        yield ctx.call_activity(update_inventory_activity, 
                                input=PaymentRequest(request_id=order_id,
                                                     item_being_purchased=order_payload.item_name,
                                                     amount=order_payload.total_cost,
                                                     quantity=order_payload.quantity))
    except Exception:
        yield ctx.call_activity(notify_activity, 
                                input=Notification(message=f'Order {order_id} Failed!'))
        return OrderResult(processed=False)

    yield ctx.call_activity(notify_activity, input=Notification(
        message=f'Order {order_id} has completed!'))
    return OrderResult(processed=True)


def notify_activity(ctx: WorkflowActivityContext, input: Notification):
    """Defines Notify Activity. This is used by the workflow to send out a notification"""
    # Create a logger
    logger = logging.getLogger('NotifyActivity')
    logger.info(input.message)



def process_payment_activity(ctx: WorkflowActivityContext, input: PaymentRequest):
    """Defines Process Payment Activity.This is used by the workflow to process a payment"""
    logger = logging.getLogger('ProcessPaymentActivity')
    logger.info(f'Processing payment: {input.request_id} for \
                {input.quantity} {input.item_being_purchased} at {input.amount} USD')
    logger.info(f'Payment for request ID {input.request_id} processed successfully')


def verify_inventory_activity(ctx: WorkflowActivityContext,
                              input: InventoryRequest) -> InventoryResult:
    """Defines Verify Inventory Activity. This is used by the workflow to verify if inventory
    is available for the order"""
    logger = logging.getLogger('VerifyInventoryActivity')

    logger.info(f'Verifying inventory for order {input.request_id} of \
                {input.quantity} {input.item_name}')
    with DaprClient(f'{address["host"]}:{address["port"]}') as client:
        result = client.get_state(store_name, input.item_name)
    if result.data is None:
        return InventoryResult(False, None)
    res_json=json.loads(str(result.data.decode('utf-8')))
    logger.info(f'There are {res_json["quantity"]} {res_json["name"]} available for purchase')
    inventory_item = InventoryItem(item_name=input.item_name,
                                  per_item_cost=res_json['per_item_cost'],
                                  quantity=res_json['quantity'])

    if res_json['quantity'] >= input.quantity:
        return InventoryResult(True, inventory_item)
    return InventoryResult(False, None)


def update_inventory_activity(ctx: WorkflowActivityContext,
                              input: PaymentRequest) -> InventoryResult:
    """Defines Update Inventory Activity. This is used by the workflow to check if inventory
    is sufficient to fulfill the order and updates inventory by reducing order quantity from
    inventory."""
    logger = logging.getLogger('UpdateInventoryActivity')

    logger.info(f'Checking inventory for order {input.request_id} for \
                {input.quantity} {input.item_being_purchased}')
    with DaprClient(f'{address["host"]}:{address["port"]}') as client:
        result = client.get_state(store_name, input.item_being_purchased)
        res_json=json.loads(str(result.data.decode('utf-8')))
        new_quantity = res_json['quantity'] - input.quantity
        per_item_cost = res_json['per_item_cost']
        if new_quantity < 0:
            raise ValueError(f'Payment for request ID {input.item_being_purchased} \
                             could not be processed. Insufficient inventory.')
        new_val = f'{{"name": "{input.item_being_purchased}", "quantity": {str(new_quantity)},\
                               "per_item_cost": {str(per_item_cost)}}}'
        client.save_state(store_name, input.item_being_purchased, new_val)
        logger.info(f'There are now {new_quantity} {input.item_being_purchased} left in stock')


def requst_approval_activity(ctx: WorkflowActivityContext,
                             input: OrderPayload):
    """Defines Request Approval Activity. This is used by the workflow to request approval
    for payment of an order. This activity is used only if the order total cost is greater than
    a particular threshold, currently 50000 USD"""
    logger = logging.getLogger('RequestApprovalActivity')

    logger.info(f'Requesting approval for payment of {input.total_cost} USD for \
                {input.quantity} {input.item_name}')
