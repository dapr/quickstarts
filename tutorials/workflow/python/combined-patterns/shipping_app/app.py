from fastapi import FastAPI, status
from dapr.clients import DaprClient
from models import Order, ShipmentRegistrationStatus, ShippingDestinationResult
import uvicorn

app = FastAPI()

DAPR_PUBSUB_COMPONENT = "shippingpubsub"
DAPR_PUBSUB_REGISTRATION_TOPIC = "shipment-registration-events"
DAPR_PUBSUB_CONFIRMED_TOPIC = "shipment-registration-confirmed-events"

@app.post("/checkDestination", status_code=status.HTTP_200_OK)
async def check_destination(order: Order):
    print(f"checkDestination: Received input: {order}.", flush=True)
    return ShippingDestinationResult(is_success=True)

@app.post("/registerShipment", status_code=status.HTTP_201_CREATED)
async def register_shipment(order: Order):
    print(f"registerShipment: Received input: {order}.", flush=True)
    status = ShipmentRegistrationStatus(order_id=order.id, is_success=True)

    with DaprClient() as dapr_client:
        dapr_client.publish_event(
            pubsub_name=DAPR_PUBSUB_COMPONENT,
            topic_name=DAPR_PUBSUB_REGISTRATION_TOPIC,
            data=status
        )
    return

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5261)