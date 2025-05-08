from fastapi import FastAPI, status
from contextlib import asynccontextmanager
from never_ending_workflow import wf_runtime, never_ending_workflow
import dapr.ext.workflow as wf
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    wf_runtime.start()
    yield
    wf_runtime.shutdown()

app = FastAPI(lifespan=lifespan)
wf_client = wf.DaprWorkflowClient()

@app.post("/start/{counter}", status_code=status.HTTP_202_ACCEPTED)
async def start_workflow(counter: int):
    instance_id = wf_client.schedule_new_workflow(
            workflow=never_ending_workflow,
            input=counter
        )
    return {"instance_id": instance_id}

@app.get("/status/{instance_id}")
async def get_status(instance_id: str):
    wf_status = wf_client.get_workflow_state(instance_id)
    return wf_status

@app.post("/suspend/{instance_id}", status_code=status.HTTP_202_ACCEPTED)
async def suspend_workflow(instance_id: str):
    wf_client.pause_workflow(instance_id);

@app.post("/resume/{instance_id}", status_code=status.HTTP_202_ACCEPTED)
async def resume_workflow(instance_id: str):
    wf_client.resume_workflow(instance_id);

@app.post("/terminate/{instance_id}", status_code=status.HTTP_202_ACCEPTED)
async def terminate_workflow(instance_id: str):
    wf_client.terminate_workflow(instance_id);

@app.delete("/purge/{instance_id}", status_code=status.HTTP_202_ACCEPTED)
async def purge_workflow(instance_id: str):
    wf_client.purge_workflow(instance_id);

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5262)
