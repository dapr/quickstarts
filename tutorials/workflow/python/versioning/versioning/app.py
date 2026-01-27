from fastapi import FastAPI, status
from contextlib import asynccontextmanager
from runtime import wf_runtime
from patching_workflow import patching_workflow
from named_versioned_workflow import named_versioned_workflow
import dapr.ext.workflow as wf
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    wf_runtime.start()
    yield
    wf_runtime.shutdown()

app = FastAPI(lifespan=lifespan)

@app.post("/start", status_code=status.HTTP_202_ACCEPTED)
async def start_workflow():
    wf_client = wf.DaprWorkflowClient()
    patching_instance_id = wf_client.schedule_new_workflow(
            workflow=patching_workflow,
            input="input"

        )
    named_versioned_instance_id = wf_client.schedule_new_workflow(
            workflow=named_versioned_workflow,
            input="input"
        )
    return {
        "workflows_instances": [
            {
                "instance_id": patching_instance_id,
                "workflow_name": "patching_workflow"
            },
            {
                "instance_id": named_versioned_instance_id,
                "workflow_name": "named_versioned_workflow"
            }
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5263)
