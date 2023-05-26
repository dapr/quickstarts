
from datetime import timedelta
import logging
import json
from time import sleep
from dapr.ext.workflow import DaprWorkflowContext, WorkflowActivityContext, when_any
from model import InventoryItem, Notification, InventoryRequest, OrderPayload, OrderResult, PaymentRequest, InventoryResult
from dapr.clients import DaprClient
from util import get_address

store_name = "statestore-actors"

address = get_address()

def order_processing_workflow(ctx: DaprWorkflowContext, orderPayload: OrderPayload):
    logging.basicConfig(level=logging.INFO)
    order_id = ctx.instance_id
    yield ctx.call_activity(notify_activity, input=Notification(message=f'Received order {order_id} for {orderPayload.quantity} {orderPayload.item_name} at ${orderPayload.total_cost} !'))
    result = yield ctx.call_activity(verify_inventory_activity, input=InventoryRequest(request_id=order_id, item_name=orderPayload.item_name, quantity=orderPayload.quantity))
    if not result.success:
        yield ctx.call_activity(notify_activity, input=Notification(message=f'Insufficient inventory for {orderPayload.item_name}!'))
        return OrderResult(processed=False)
    
    if orderPayload.total_cost > 50000:
        yield ctx.call_activity(requst_approval_activity, input=orderPayload)
        approval_flag = ctx.wait_for_external_event("manager_approval")
        timeout_event = ctx.create_timer(timedelta(seconds=200))
        winner = yield when_any([approval_flag, timeout_event])
        if winner == timeout_event:
            yield ctx.call_activity(notify_activity, input=Notification(message=f'Payment for order {order_id} has been cancelled due to timeout!'))
            return OrderResult(processed=False)

        if approval_flag.get_result()["approval"]:
            yield ctx.call_activity(notify_activity, input=Notification(message=f'Payment for order {order_id} has been approved!'))
        else:
            yield ctx.call_activity(notify_activity, input=Notification(message=f'Payment for order {order_id} has been rejected!'))
            return OrderResult(processed=False)    
    
    yield ctx.call_activity(process_payment_activity, input=PaymentRequest(request_id=order_id, item_being_purchased=orderPayload.item_name, amount=orderPayload.total_cost, quantity=orderPayload.quantity))

    try:
        yield ctx.call_activity(update_inventory_activity, input=PaymentRequest(request_id=order_id, item_being_purchased=orderPayload.item_name, amount=orderPayload.total_cost, quantity=orderPayload.quantity))
    except Exception:
        yield ctx.call_activity(notify_activity, input=Notification(message=f'Order {order_id} Failed!'))
        return OrderResult(processed=False)

    yield ctx.call_activity(notify_activity, input=Notification(message=f'Order {order_id} has completed!'))
    return OrderResult(processed=True)

def notify_activity(ctx: WorkflowActivityContext, input: Notification):
    # Create a logger
    logger = logging.getLogger('NotifyActivity')
    logger.info(input.message)


def process_payment_activity(ctx: WorkflowActivityContext, input: PaymentRequest):
    logger = logging.getLogger('ProcessPaymentActivity')
    logger.info(f'Processing payment: {input.request_id} for {input.quantity} {input.item_being_purchased} at {input.amount} USD')
    sleep(7)
    logger.info(f'Payment for request ID {input.request_id} processed successfully')


def verify_inventory_activity(ctx: WorkflowActivityContext,
                                input: InventoryRequest) -> InventoryResult:
    logger = logging.getLogger('VerifyInventoryActivity')

    logger.info(f'Verifying inventory for order {input.request_id} of {input.quantity} {input.item_name}')
    inventoryItem: InventoryItem
    with DaprClient(f'{address["host"]}:{address["port"]}') as client:
        result = client.get_state(store_name, input.item_name)
    if result.data is None:
        return InventoryResult(False, None)
    res_json=json.loads(str(result.data.decode('utf-8')))
    logger.info(f'There are {res_json["quantity"]} {res_json["name"]} available for purchase')
    inventoryItem = InventoryItem(item_name=input.item_name, per_item_cost=res_json['per_item_cost'], quantity=res_json['quantity'])

    if res_json['quantity'] >= input.quantity:
        return InventoryResult(True, inventoryItem)
    return InventoryResult(False, None)

def update_inventory_activity(ctx: WorkflowActivityContext,
                                input: PaymentRequest) -> InventoryResult:
    logger = logging.getLogger('UpdateInventoryActivity')

    logger.info(f'Checking inventory for order {input.request_id} for {input.quantity} {input.item_being_purchased}')
    sleep(5)
    with DaprClient(f'{address["host"]}:{address["port"]}') as client:
        result = client.get_state(store_name, input.item_being_purchased)
        res_json=json.loads(str(result.data.decode('utf-8')))
        newQuantity = res_json['quantity'] - input.quantity
        per_item_cost = res_json['per_item_cost']
        if newQuantity < 0:
            raise ValueError(f'Payment for request ID {input.item_being_purchased} could not be processed. Insufficient inventory.')
        newVal = f'{{"name": "{input.item_being_purchased}", "quantity": {str(newQuantity)}, "per_item_cost": {str(per_item_cost)}}}'
        client.save_state(store_name, input.item_being_purchased, newVal)
        logger.info(f'There are now {newQuantity} {input.item_being_purchased} left in stock')

def requst_approval_activity(ctx: WorkflowActivityContext,
                                input: OrderPayload):
    logger = logging.getLogger('RequestApprovalActivity')

    logger.info(f'Requesting approval for payment of {input.total_cost} USD for {input.quantity} {input.item_name}')
