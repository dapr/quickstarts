from fastapi import FastAPI
from pydantic import BaseModel
from contextlib import asynccontextmanager
from dapr.ext.workflow.workflow_runtime import WorkflowRuntime
from dapr.ext.workflow import DaprWorkflowClient
from datetime import timedelta
import dapr.ext.workflow as wf

import os, json, time
from dataclasses import dataclass
import openai

wfr = WorkflowRuntime()

# === OpenAI Setup ===
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)

@dataclass
class Approval:
    approved: bool
    reviewer: str
    notes: str

    @staticmethod
    def from_dict(dict):
        return Approval(**dict)

# === Activities ===
def analyze_contract(ctx, contract):
    prompt = f"""
You are a contract analysis assistant.
Summarize key clauses and identify potential risks.
You **must** return valid JSON: summary, risk_score (0-100), risky_clauses.
Contract:
{contract['text']}
"""
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=800,
        temperature=0.3,
        response_format={ "type": "json_object" }
    )

    response_text = response.choices[0].message.content
   
    try:
        return json.loads(response_text)
    except:
        return {
            "summary": response_text,
            "risk_score": 50,
            "risky_clauses": []
        }

def draft_amendment(ctx, clauses):
    prompt = f"Draft legally sound amendments for:\n{clauses}"
    
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=800,
        temperature=0.3,
    )

    return response.choices[0].message.content

def send_for_approval(ctx, amendment):
    print(f"[Send] Amendment sent: {amendment}...", flush=True)
    time.sleep(1)
    return {"sent": True}

def final_report(ctx, all_results):
    return json.dumps(all_results, indent=2)

# === Workflow ===
def contract_review_wf(ctx: wf.DaprWorkflowContext, contracts: list):
    results = []
    tasks = [ctx.call_activity(analyze_contract, input=contract) for contract in contracts]
    analyses = yield wf.when_all(tasks)

    for contract, analysis in zip(contracts, analyses):
        result = {"id": contract["id"], "analysis": analysis}

        if analysis["risk_score"] > 70:
            amendment = yield ctx.call_activity(draft_amendment, input=analysis["risky_clauses"])
            yield ctx.call_activity(send_for_approval, input=amendment)

            print("Waiting on approval for contract " + contract['id'], flush=True)
            approval_event = ctx.wait_for_external_event("contract_approval")
            timer = ctx.create_timer(timedelta(hours=24))
            completed_task = yield wf.when_any([approval_event, timer])

            if completed_task == approval_event:
                event_result = Approval.from_dict(approval_event.get_result())
                result["approved"] = event_result.approved
                result['approver'] = event_result.reviewer
                result['notes'] = event_result.notes
            else:
                result["approved"] = False

        results.append(result)

    report = yield ctx.call_activity(final_report, input=results)
    print(report, flush=True)
    return report

# === FastAPI Lifespan ===
@asynccontextmanager
async def lifespan(app: FastAPI):
    wfr.register_workflow(contract_review_wf)
    wfr.register_activity(analyze_contract)
    wfr.register_activity(draft_amendment)
    wfr.register_activity(send_for_approval)
    wfr.register_activity(final_report)
    
    wfr.start()
    print("== Dapr Workflow Runtime started ==")
    yield
    wfr.shutdown()
    print("== Dapr Workflow Runtime stopped ==")

app = FastAPI(lifespan=lifespan)

# === API ===
class ContractInput(BaseModel):
    id: str
    text: str

class ApprovalInput(BaseModel):
    approved: bool
    reviewer: str
    notes: str

@app.post("/review")
def start_contract_review(contract: ContractInput):
    client = DaprWorkflowClient()
    instance_id = f"workflow-{contract.id}"
    workflow_input = [{"id": contract.id, "text": contract.text}]

    scheduled_id = client.schedule_new_workflow(
        workflow=contract_review_wf,
        input=workflow_input,
        instance_id=instance_id
    )
    return {"instance_id": scheduled_id, "status": "started"}

@app.post("/approve/{instance_id}")
def approve_contract(instance_id: str, approval: ApprovalInput):
    client = DaprWorkflowClient()
    client.raise_workflow_event(
        instance_id=instance_id,
        event_name="contract_approval",
        data=approval.model_dump()
    )
    return {"status": "approval sent", "instance_id": instance_id}
