from fastapi import FastAPI, status
from contextlib import asynccontextmanager
from basic_workflow import wf_runtime, basic_workflow
import dapr.ext.workflow as wf
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    wf_runtime.start()
    yield
    wf_runtime.shutdown()

app = FastAPI(lifespan=lifespan)

@app.post("/start/{input}", status_code=status.HTTP_202_ACCEPTED)
async def start_workflow(input: str):
    """
    The DaprWorkflowClient is the API to manage workflows.
    Here it is used to schedule a new workflow instance.
    """
    wf_client = wf.DaprWorkflowClient()
    instance_id = wf_client.schedule_new_workflow(
            workflow=basic_workflow,
            input=input
        )
    return {"instance_id": instance_id}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5254)