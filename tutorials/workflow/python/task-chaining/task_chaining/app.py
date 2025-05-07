from fastapi import FastAPI, status
from chaining_workflow import wf_runtime, chaining_workflow
import dapr.ext.workflow as wf
import uvicorn

app = FastAPI()

@app.post("/start", status_code=status.HTTP_202_ACCEPTED)
async def start_workflow():
    wf_client = wf.DaprWorkflowClient()
    instance_id = wf_client.schedule_new_workflow(
            workflow=chaining_workflow,
            input="This"
        )
    return {"instance_id": instance_id}

if __name__ == "__main__":
    wf_runtime.start()
    uvicorn.run(app, host="0.0.0.0", port=5255)