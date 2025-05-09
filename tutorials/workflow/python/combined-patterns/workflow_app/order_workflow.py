from dapr.clients import DaprClient
from models import Order, OrderItem, ActivityResult, ShippingDestinationResult, PaymentResult, RegisterShipmentResult, ReimburseCustomerResult
import dapr.ext.workflow as wf
import inventory_management as im

SHIPMENT_REGISTERED_EVENT = "shipment-registered-events"
DAPR_PUBSUB_COMPONENT = "shippingpubsub"
DAPR_PUBSUB_REGISTRATION_TOPIC = "shipment-registration-events";

wf_runtime = wf.WorkflowRuntime()

@wf_runtime.workflow(name='order_workflow')
def order_workflow(ctx: wf.DaprWorkflowContext, order: Order):
    tasks = [
        ctx.call_activity(check_inventory, input=order.order_item),
        ctx.call_activity(check_shipping_destination, input=order)
        ]
    yield wf.when_all(tasks);

    return wf_result

@wf_runtime.activity(name='check_inventory')
def check_inventory(ctx: wf.WorkflowActivityContext, order_item: OrderItem) -> ActivityResult:
    print(f'check_inventory: Received input: {order_item}.', flush=True)
    is_available = im.check_inventory(order_item)
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