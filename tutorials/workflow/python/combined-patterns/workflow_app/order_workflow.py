from dapr.clients import DaprClient
from datetime import timedelta
from models import Order, OrderItem,OrderStatus, ActivityResult, ShippingDestinationResult, ShipmentRegistrationStatus, PaymentResult, RegisterShipmentResult, ReimburseCustomerResult, UpdateInventoryResult
import dapr.ext.workflow as wf
import inventory_management as im

SHIPMENT_REGISTERED_EVENT = "shipment-registered-events"
DAPR_PUBSUB_COMPONENT = "shippingpubsub"
DAPR_PUBSUB_REGISTRATION_TOPIC = "shipment-registration-events";

wf_runtime = wf.WorkflowRuntime()

@wf_runtime.workflow(name='order_workflow')
def order_workflow(ctx: wf.DaprWorkflowContext, order: Order):
    # First, two independent activities are called in parallel (fan-out/fan-in pattern):
    if not ctx.is_replaying:
        newOrder = Order.from_dict(order);
        print(f'order_workflow: Received input: {newOrder}.', flush=True)
        print(f'order_workflow: Received order_item: {newOrder.order_item}.', flush=True)
        print(f'order_workflow: Received product_id: {newOrder.order_item.product_id}.', flush=True)

    tasks = [
        #ctx.call_activity(check_inventory, input=order.order_item),
        ctx.call_activity(check_shipping_destination, input=order)
        ]
    task_results = yield wf.when_all(tasks);

    if any(not task_result.is_success for task_result in task_results):
        message = f"Order processing failed. Reason: {next(task_result for task_result in task_results if not task_result.is_success).message}"
        return OrderStatus(is_success=False, message=message)

    # Two activities are called in sequence (chaining pattern) where the update_inventory
    # activity is dependent on the result of the process_payment activity:
    payment_result = yield ctx.call_activity(process_payment, input=order)
    if payment_result.is_success:
        yield ctx.call_activity(update_inventory, input=order.order_item)

    # The register_shipment activity is using pub/sub messaging to communicate with the ShippingApp.
    yield ctx.call_activity(register_shipment, input=order)

    # The shipping_app will also use pub/sub messaging back to the WorkflowApp and raise an event.
    # The workflow will wait for the event to be received or until the timeout occurs.
    shipment_registered_task = ctx.wait_for_external_event(event_name=SHIPMENT_REGISTERED_EVENT)
    timeout_task = ctx.create_timer(fire_at=timedelta(seconds=300))
    winner = yield wf.when_any([shipment_registered_task, timeout_task])
    if winner == timeout_task:
        # Timeout occurred, the shipment-registered-event was not received.
        message = f"Shipment registration status for {order.id} timed out."
        return OrderStatus(is_success=False, message=message)
    
    shipment_registration_status = ShipmentRegistrationStatus.from_dict(shipment_registered_task.get_result())
    if not shipment_registration_status.is_success:
        # This is the compensation step in case the shipment registration event was not successful.
        yield ctx.call_activity(reimburse_customer, input=order)
        message = f"Shipment registration status for {order.id} failed. Customer is reimbursed."
        return OrderStatus(is_success = False, message = message);
    
    return OrderStatus(is_success=True, message=f"Order {order.id} processed successfully.")

@wf_runtime.activity(name='check_inventory')
def check_inventory(ctx: wf.WorkflowActivityContext, order_item: OrderItem) -> ActivityResult:
    print(f'check_inventory: Received input: {order_item}.', flush=True)
    is_available = im.check_inventory(order_item)
    print(f'check_inventory: is_available: {is_available}.', flush=True)
    return ActivityResult(is_success=is_available)

@wf_runtime.activity(name='check_shipping_destination')
def check_shipping_destination(ctx: wf.WorkflowActivityContext, order: Order) -> ActivityResult:
    print(f'check_shipping_destination: Received input: {order}.', flush=True)

    with DaprClient() as dapr_client:
        response = dapr_client.invoke_method(
            app_id="shipping",
            method_name="checkDestination",
            http_verb="POST",
            data=order)
        if not response.status_code == 200:
            print(f'Failed to register shipment. Reason: {response.text}.', flush=True)
            raise Exception(f"Failed to register shipment. Reason: {response.text}.")
        result = ShippingDestinationResult.from_dict(response.json())
        return ActivityResult(is_success=result.is_success)

@wf_runtime.activity(name='process_payment')
def process_payment(ctx: wf.WorkflowActivityContext, order: Order) -> PaymentResult:
    print(f'process_payment: Received input: {order}.', flush=True)
    return PaymentResult(is_success=True)

@wf_runtime.activity(name='update_inventory')
def update_inventory(ctx: wf.WorkflowActivityContext, order_item: OrderItem) -> ActivityResult:
    print(f'update_inventory: Received input: {order_item}.', flush=True)
    update_inventory_result = im.update_inventory(order_item)
    return update_inventory_result

@wf_runtime.activity(name='reimburse_customer')
def reimburse_customer(ctx: wf.WorkflowActivityContext, order: Order) -> ReimburseCustomerResult:
    print(f'reimburse_customer: Received input: {order}.', flush=True)
    return ReimburseCustomerResult(is_success=True)

@wf_runtime.activity(name='register_shipment')
def register_shipment(ctx: wf.WorkflowActivityContext, order: Order) -> RegisterShipmentResult:
    print(f'register_shipment: Received input: {order}.', flush=True)

    with DaprClient() as dapr_client:
        dapr_client.publish_event(
            pubsub_name=DAPR_PUBSUB_COMPONENT,
            topic_name=DAPR_PUBSUB_REGISTRATION_TOPIC,
            data=order
        )
        return RegisterShipmentResult(is_success=True)