from fastapi import FastAPI, status
from contextlib import asynccontextmanager
import uvicorn

import dapr.ext.workflow as wf

wf_runtime = wf.WorkflowRuntime()

@asynccontextmanager
async def lifespan(app: FastAPI):
    wf_runtime.start()
    yield
    wf_runtime.shutdown()

app = FastAPI(lifespan=lifespan)

@app.post("/start", status_code=status.HTTP_202_ACCEPTED)
async def start_workflow():
    wf_client = wf.DaprWorkflowClient()
    instance_id = wf_client.schedule_new_workflow(
            workflow=notify_user,
            input="user_id"

        )
    return {"instance_id": instance_id}

@wf_runtime.versioned_workflow(name='notify_user', is_latest=True)
def notify_user(ctx: wf.DaprWorkflowContext, wf_input: str):
    if ctx.is_patched("send_sms"):
        result = yield ctx.call_activity(send_sms, input=wf_input)
    else:
        result = yield ctx.call_activity(send_email, input=wf_input)
    return result


@wf_runtime.activity
def send_email(ctx: wf.WorkflowActivityContext, act_input: str) -> str:
    print(f'send_email: Received input: {act_input}.', flush=True)
    return f"Sent email to {act_input}"

@wf_runtime.activity
def send_sms(ctx: wf.WorkflowActivityContext, act_input: str) -> str:
    print(f'send_sms: Received input: {act_input}.', flush=True)
    return f"Sent SMS to {act_input}"


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5263)
