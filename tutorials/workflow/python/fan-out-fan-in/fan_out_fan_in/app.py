from fastapi import FastAPI, status
from contextlib import asynccontextmanager
from fanoutfanin_workflow import wf_runtime, fanoutfanin_workflow
from typing import List
import dapr.ext.workflow as wf
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    wf_runtime.start()
    yield
    wf_runtime.shutdown()

app = FastAPI(lifespan=lifespan)

@app.post("/start", status_code=status.HTTP_202_ACCEPTED)
async def start_workflow(words: List[str]):
    wf_client = wf.DaprWorkflowClient()
    instance_id = wf_client.schedule_new_workflow(
            workflow=fanoutfanin_workflow,
            input=words
        )
    return {"instance_id": instance_id}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5256)

