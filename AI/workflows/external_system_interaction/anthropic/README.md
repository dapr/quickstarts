# 🧠 Agentic Contract Review Workflow (Dapr + Claude + FastAPI)

This project demonstrates how to build a **durable, agentic AI workflow** using [Dapr Workflows](https://docs.dapr.io/developing-applications/building-blocks/workflow/) and [Anthropic Claude](https://www.anthropic.com/claude). It showcases how to mix the intelligence of a large language model with the resilience and statefulness of a distributed workflow engine.

---

## ✨ What It Does

Claude plays the role of a contract analyst, and Dapr Workflows orchestrates the process across time:

1. Claude reviews each contract and identifies risky clauses.
2. If the contract is risky, Claude drafts amendments.
3. The workflow **waits for human approval** — with timeout and persistence.
4. The results are compiled into a final structured report.

Everything runs in a clean FastAPI service using Dapr's durable execution engine underneath.

Even though this example is using Claude, you can replace the Anthropic SDK with any other LLM provider.

---

## 🛠 Prerequisites

- Python 3.10+
- [Dapr and Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- Docker (for Redis state backend via `dapr init`)
- Anthropic Claude API Key (sign up at [Anthropic](https://www.anthropic.com/))

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 🚀 Running the App

### 1. Start the Dapr-enabled FastAPI server

```bash
dapr run --app-id contract-review --app-port 8000 -- uvicorn app:app --reload
```

This launches the FastAPI app with Dapr Workflow runtime. You’ll see:

```
== Dapr Workflow Runtime started ==
```

---

### 2. Submit a contract for review

For subsequent runs, make sure to use a new `id`.

```bash
curl -X POST http://localhost:8000/review \
  -H "Content-Type: application/json" \
  -d '{
    "id": "C100",
    "text": "SERVICE AGREEMENT\n\nThis Service Agreement (\"Agreement\") is entered into between ACME Data Solutions, Inc. (\"Provider\") and ClientCo LLC (\"Client\") effective as of August 1, 2025.\n\n1. SERVICES\nProvider agrees to deliver cloud data analytics services to Client as described in Exhibit A.\n\n2. PAYMENT TERMS\nClient shall pay Provider $50,000 per month, due within 15 days of invoice date. Failure to pay within 30 days may result in suspension of services.\n\n3. DATA OWNERSHIP\nAll data processed shall become the property of Provider, including any derivative works, without limitation.\n\n4. LIABILITY LIMITATION\nProvider shall not be liable for any damages, including loss of revenue, indirect, incidental, or consequential damages, even if advised of the possibility thereof.\n\n5. TERMINATION\nEither party may terminate this Agreement at any time with 5 days’ written notice. Client shall remain responsible for payment for all services rendered up to the termination date.\n\n6. CONFIDENTIALITY\nBoth parties agree to maintain confidentiality of proprietary information for a period of 12 months following termination.\n\nIN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above."
}'
```

This creates a new durable workflow instance: `workflow-C100`.

When starting future contract approval workflows, use a new workflow instance id for every call.

---

### 3. (Optional) Approve the contract if required

If Claude flags the contract as high risk, the workflow pauses and waits for this:

```bash
curl -X POST http://localhost:8000/approve/workflow-C100   -H "Content-Type: application/json"   -d '{
    "approved": true,
    "reviewer": "Alice",
    "notes": "Reviewed and approved as-is."
}'
```

If approval is not received in 24 hours, the workflow times out and continues gracefully.

---

## 🧠 Why Use Dapr Workflows?

Traditional LLM apps forget things, fail silently, and can’t wait.

Dapr Workflows gives your agent:

- **Durability** — survives restarts and crashes
- **Event waiting** — pauses for human input or external triggers
- **Retries & orchestration** — handles timeouts, branches, parallel execution
- **Composability** — plug in tools, APIs, databases, and humans

---

## 🧪 Example Output

```json
{
  "id": "C100",
  "analysis": {
    "summary": "The contract includes broad data ownership and limited liability.",
    "risk_score": 82,
    "risky_clauses": ["3. Data Ownership", "4. Liability Limitation"]
  },
  "approved": true,
  "approver": "Alice",
  "notes": "Reviewed and approved as-is."
}
```

---

## 📚 Resources

- [🧭 Dapr Workflow Documentation](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/)