from fastapi import FastAPI, status
from contextlib import asynccontextmanager
from order_workflow import wf_runtime, order_workflow, SHIPMENT_REGISTERED_EVENT
from models import Order, ShipmentRegistrationStatus, ProductInventory
import inventory_management as im
import dapr.ext.workflow as wf
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    wf_runtime.start()
    yield
    wf_runtime.shutdown()

app = FastAPI(lifespan=lifespan)

@app.post("/start", status_code=status.HTTP_202_ACCEPTED)
async def start_workflow(order: Order):
    """ 
    This is to ensure to have enough inventory for the order.
    So the manual restock endpoint is not needed in this sample.
    """
    im.create_default_inventory();

    wf_client = wf.DaprWorkflowClient()
    instance_id = wf_client.schedule_new_workflow(
            workflow=order_workflow,
            input=order
        )
    return {"instance_id": instance_id}

"""
This endpoint handles messages that are published to the shipment-registration-confirmed-events topic.
It uses the workflow management API to raise an event to the workflow instance to indicate that the 
shipment has been registered by the ShippingApp.
"""
@app.post("/shipmentRegistered", status_code=status.HTTP_202_ACCEPTED)
async def start_workflow(status: ShipmentRegistrationStatus):
    print(f"Shipment registered for order {status.order_id}.", flush=True)

    wf_client = wf.DaprWorkflowClient()
    wf_client.raise_workflow_event(
            instance_id=status.order_id,
            event_name=SHIPMENT_REGISTERED_EVENT,
            data=status
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5260, log_level="debug")