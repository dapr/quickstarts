from fastapi import FastAPI, status
from dapr.clients import DaprClient
from models import Order, CustomerInfo, ShipmentRegistrationStatus, ShippingDestinationResult
from fastapi_cloudevents import CloudEvent
import uvicorn

app = FastAPI()

DAPR_PUBSUB_COMPONENT = "shippingpubsub"
DAPR_PUBSUB_CONFIRMED_TOPIC = "shipment-registration-confirmed-events"

@app.post("/checkDestination", status_code=status.HTTP_200_OK)
async def check_destination(customer_info: CustomerInfo):
    customer_info = CustomerInfo.model_validate(customer_info)
    print(f"checkDestination: Received input: {customer_info}.", flush=True)
    return ShippingDestinationResult(is_success=True)

@app.post("/registerShipment", status_code=status.HTTP_201_CREATED, response_model=None)
async def register_shipment(cloud_event: CloudEvent) -> None:
    order = Order.model_validate(cloud_event.data)
    print(f"registerShipment: Received input: {cloud_event}.", flush=True)

    print(f"registerShipment: Converted to order: {order}.", flush=True)
    status = ShipmentRegistrationStatus(order_id=order.id, is_success=True)

    with DaprClient() as dapr_client:
        dapr_client.publish_event(
            pubsub_name=DAPR_PUBSUB_COMPONENT,
            topic_name=DAPR_PUBSUB_CONFIRMED_TOPIC,
            data=status.model_dump_json(),
            data_content_type='application/json'
        )
    return

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5261)