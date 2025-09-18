## 🧠 Agentic Human-In-The-Loop — Durable Workflows with Dapr (+ OpenAI, Gemini, Anthropic)

This repo demonstrates a durable, agentic AI workflow for contract review built on Dapr Workflows and a simple FastAPI service. It ships three interchangeable implementations using different LLM providers:

* `./anthropic/` — Anthropic Claude–based contract analyst
* `./gemini/` — Google Gemini–based contract analyst
* `./openai/` — OpenAI-based contract analyst
    
Each example uses the same workflow shape: **analyze → decide → (optionally) wait for human approval → finalize → report**. The only difference is the LLM client and prompts used under the hood.

Start in the provider folder you want (e.g., cd gemini) and follow that README.

### ✨ What the Agentic Workflow Does

*   **LLM analysis**: Extract risks and summarize the contract.
*   **Decision**: If risk > threshold, propose amendments and pause for human approval.
*   **Durability**: The workflow persists state and can survive restarts and timeouts.
*   **Output**: Emit a structured JSON report for downstream systems.
    

All three implementations share these semantics; you can swap providers without changing orchestration logic.

### 🧩 Tech Highlights

*   **Dapr Workflows**: Durable execution, timers, retries, external event waiting.
*   **FastAPI**: Minimal HTTP surface for starting workflows and posting approvals.
    
### 🛠 Prerequisites (All Providers)

*   Python 3.10+
*   [Dapr and Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
*   Docker (for local Dapr dependencies)  
*   Provider API key (one of):
    *   **OpenAI**: OPENAI\_API\_KEY
    *   **Gemini**: GEMINI\_API\_KEY
    *   **Anthropic**: ANTHROPIC\_API\_KEY
        
Each subfolder has its own requirements.txt and provider-specific notes.

### 🚀 Quickstart

Pick a provider folder and follow its README. The flow is generally:

```bash
# 1) Choose a provider implementation
cd openai   # or gemini / anthropic

# 2) Install deps
pip install -r requirements.txt

# 3) Export your provider API key
export OPENAI_API_KEY=... // or GEMINI_API_KEY or ANTHROPIC_API_KEY

# 4) Run the FastAPI app with Dapr
dapr run --app-id contract-review --app-port 8000 -- uvicorn app:app --reload

# 5) Kick off a contract review (example payloads in each README)
curl -X POST http://localhost:8000/review -H "Content-Type: application/json" -d '{ "...": "..." }'

# 6) If required, approve later by posting to /approve/{instanceId}

curl -X POST http://localhost:8000/approve/workflow-<CONTRACT-ID> -H "Content-Type: application/json"   -d '{
    "approved": true,
    "reviewer": "Alice",
    "notes": "Reviewed and approved."
}'
```

### 🔄 Choosing a Provider

Start with the provider you already use in production or prefer for pricing/latency.

The workflow contract (endpoints, payloads, and output JSON) is held constant across implementations to make A/B comparisons trivial.

#### 🧪 Example Endpoints (common shape)

*   POST /review — Start a new workflow instance with a contract payload
*   POST /approve/{instanceId} — Resume a paused workflow with human approval    

See each provider's README for exact payloads and sample cURL commands.

#### 🧱 Architecture (High-Level)

```yaml
[Client] ──HTTP──> [FastAPI + Dapr Workflow]
                       │
                       ├─ Activity: LLM Analysis (OpenAI/Gemini/Anthropic)
                       ├─ Timer/Wait: Human Approval (external event)
                       └─ Activity: Finalize Report → JSON
```

*   **Durability**: Dapr Workflow state persists in the configured state store.
*   **Resilience**: Retries and timers are handled by the workflow runtime.
*   **Extensibility**: Add tools (RAG, DB lookups, signature checks) as new activities.
    
### 🧯 Troubleshooting

*   Run dapr status to confirm the sidecar and default components are healthy. 
*   If workflow doesn't resume, verify you're posting approval to the correct instance ID.
* If the workflow doesn't kick off, make sure you're using a new instance ID in the /review request.
*   Check provider-specific rate limits or key scopes.   
*   Inspect app logs (and Dapr sidecar logs) for activity failures and retries.
    
### 📚 Related Docs
--------------------------------

*   **Dapr Workflows**: [https://docs.dapr.io/developing-applications/building-blocks/workflow/](https://docs.dapr.io/developing-applications/building-blocks/workflow/)
*   **OpenAI Python SDK**: [https://platform.openai.com/docs/](https://platform.openai.com/docs/)
*   **Google Gemini**: [https://aistudio.google.com/](https://aistudio.google.com/)
*   **Anthropic Claude**: [https://docs.anthropic.com/](https://docs.anthropic.com/)

<br>
Built with ❤️ using Dapr Workflows. Swap the model, keep the durability.