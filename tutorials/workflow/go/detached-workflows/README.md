# Dapr Detached Workflows — Fire-and-forget order audit

This example demonstrates **detached workflows**: a workflow that asks the runtime to start a new, fully independent workflow instance and then immediately continues — without waiting for it. See the [Detached workflows](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-detached/) docs for the concept overview.

The scenario is order processing with an audit trail. A customer-facing `ProcessOrderWorkflow` confirms the order as fast as possible and hands the slower compliance audit off to a **detached** `AuditWorkflow`. The order returns right away while the audit keeps running on its own.

## Detached vs. child workflows

A detached workflow is *not* a child workflow. There is **no parent linkage**: nothing flows back to the caller, and the two lifecycles are completely independent.

| Aspect | Child workflow | Detached workflow |
|---|---|---|
| Lifecycle coupling | Coupled to caller | Fully independent |
| Caller behavior | Awaits completion | Continues immediately |
| Return values | Flow back to caller | Nothing returned |
| Parent termination | Terminates the child | No effect on the detached workflow |
| Appears as | Child of the caller | Top-level workflow (its own history chain) |

Use detached workflows for fire-and-forget downstream work (notifications, audits, cleanup), multi-tenant fan-out (one isolated workflow per entity), or forking a long-running workflow that shouldn't inflate the caller's history.

## Workflow architecture

```
ProcessOrderWorkflow (caller)
├── ProcessPayment                       (activity, awaited)
└── ScheduleNewWorkflow(AuditWorkflow)   ← detached: fire-and-forget, returns the instance ID synchronously
        AuditWorkflow (detached, top-level — no parent linkage)
        ├── RecordAudit                  (activity)
        ├── CreateTimer(5s)              ← stands in for slower, independent work
        └── ArchiveAudit                 (activity)
```

`ProcessOrderWorkflow` charges the customer, then detaches the audit and returns its confirmation. It never awaits the audit. `AuditWorkflow` runs to completion **after** the order is already done, proving the two are independent.

## The API

Call `ScheduleNewWorkflow` from inside a workflow. It returns the new instance ID **synchronously** — there is no task to await:

```go
auditID, err := ctx.ScheduleNewWorkflow(AuditWorkflow,
    workflow.WithDetachedWorkflowInput(AuditRecord{OrderID: order.ID, Amount: order.Amount}),
    workflow.WithDetachedWorkflowInstanceID("audit-"+order.ID),
)
```

Options:

| Option | Purpose |
|---|---|
| `WithDetachedWorkflowInput(any)` | JSON input for the detached workflow |
| `WithDetachedWorkflowInstanceID(string)` | Explicit instance ID. **Omit** it and the runtime generates a deterministic `"<callerInstanceID>-<n>"` ID. An empty string is rejected. |
| `WithDetachedWorkflowStartTime(time.Time)` | Defer the start until a given time |
| `WithDetachedWorkflowAppID(string)` | Run the detached workflow in a different app |
| `WithDetachedWorkflowAppNamespace(string)` | Namespace of that app (must be combined with the app ID, and must match the caller's namespace) |

Because there is no parent linkage, the detached workflow is a top-level instance. Anything holding its ID — including the caller, which got it back from `ScheduleNewWorkflow` — can look it up and track it like any other workflow.

## Running this example

Requires Dapr `1.19.0+` (detached workflows), `go-sdk v1.15.0+`, and `durabletask-go v0.12.2+`.

Build the example:

<!-- STEP
name: Build detached-workflows
expected_stdout_lines:
  - "detached-workflows build OK"
output_match_mode: substring
background: false
timeout_seconds: 180
-->

```bash
go build -o detached-app . && echo "detached-workflows build OK"
```

<!-- END_STEP -->

Run the demo:

<!-- STEP
name: Run detached-workflows demo
expected_stdout_lines:
  - "[ProcessPayment] Charged $150 for order order-1001"
  - "ProcessOrderWorkflow COMPLETED"
  - "detached an audit that runs independently: audit-order-1001"
  - "status right now: RUNNING"
  - "Detached audit COMPLETED independently: audit-order-1001"
output_match_mode: substring
background: false
timeout_seconds: 120
sleep: 5
-->

```bash
dapr run -f .
```

<!-- END_STEP -->

The app runs once and exits on its own — no Ctrl+C needed.

## Expected output

```
========================================================
= DETACHED WORKFLOWS DEMO — fire-and-forget order audit =
========================================================

[main] Scheduling ProcessOrderWorkflow (order-1001)
[ProcessOrder] Processing order order-1001 (wireless headphones, $150)
[ProcessPayment] Charged $150 for order order-1001
[ProcessOrder] Detached audit workflow audit-order-1001 — fire and forget, not awaiting it
[ProcessOrder] Order order-1001 confirmed; returning now while the audit runs on its own

[main] ProcessOrderWorkflow COMPLETED: confirmed
[main] The order is done, but it detached an audit that runs independently: audit-order-1001
[main] audit-order-1001 status right now: RUNNING  <-- caller already finished, detached workflow is still going
[main] Waiting for the detached audit to finish independently...
[Audit] Starting independent audit for order order-1001
[RecordAudit] Recording audit entry for order order-1001 ($150)
[ArchiveAudit] Archived audit for order order-1001
[Audit] Audit for order order-1001 complete
[main] Detached audit COMPLETED independently: audit-order-1001
==========
= DONE =
==========
```

The `[Audit]`, `[RecordAudit]`, and `[ArchiveAudit]` lines come from the detached workflow, which runs concurrently — their exact interleaving with the `[main]` lines may vary between runs.

## What happened?

1. `main` schedules `ProcessOrderWorkflow` (`order-1001`) and waits for it.
2. The order workflow charges payment, then calls `ScheduleNewWorkflow` to **detach** `AuditWorkflow`. The call returns the audit's instance ID (`audit-order-1001`) immediately, and the order workflow returns its confirmation without awaiting the audit.
3. The order is already `COMPLETED`, but when `main` looks up the audit it is still `RUNNING` — the two workflows have independent lifecycles.
4. `main` then waits for the audit, which completes on its own as a top-level workflow. Its result never flowed back to the order workflow that started it.

## Files

```
detached-workflows/
├── README.md      # this file
├── dapr.yaml      # `dapr run -f .` config (appID, resources, command)
├── makefile       # wires the example into `make validate`
├── main.go        # registry + worker; schedules the order, observes the detached audit
├── models.go      # Order, OrderResult, AuditRecord, AuditResult
├── workflow.go    # ProcessOrderWorkflow, AuditWorkflow, and the activities
├── go.mod         # module + deps
└── go.sum
```
