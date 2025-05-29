from fastapi import FastAPI, status
from contextlib import asynccontextmanager
from resiliency_and_compensation_workflow import wf_runtime, resiliency_and_compensation_workflow
import dapr.ext.workflow as wf
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    wf_runtime.start()
    yield
    wf_runtime.shutdown()

app = FastAPI(lifespan=lifespan)

@app.post("/start/{wf_input}", status_code=status.HTTP_202_ACCEPTED)
async def start_workflow(wf_input: int):
    wf_client = wf.DaprWorkflowClient()
    instance_id = wf_client.schedule_new_workflow(
            workflow=resiliency_and_compensation_workflow,
            input=wf_input
        )
    return {"instance_id": instance_id}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5264)