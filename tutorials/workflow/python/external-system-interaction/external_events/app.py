from fastapi import FastAPI, status
from contextlib import asynccontextmanager
from external_events_workflow import wf_runtime, external_events_workflow, Order
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
    The DaprWorkflowClient is the API to manage workflows.
    Here it is used to schedule a new workflow instance.
    """
    wf_client = wf.DaprWorkflowClient()
    instance_id = wf_client.schedule_new_workflow(
            workflow=external_events_workflow,
            input=order,
            instance_id=order.id
        )
    return {"instance_id": instance_id}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5258)