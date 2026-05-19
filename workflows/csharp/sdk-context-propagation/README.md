# Dapr Workflow — Context Propagation (.NET SDK)

This quickstart demonstrates **workflow history propagation**, a new feature in Dapr 1.18 that lets a parent workflow share its execution history with child workflows. Downstream services can inspect that history to make trust-aware decisions — without any external state store or custom messaging.

> **Runtime requirement**: Dapr 1.18+ ([dapr/dapr#9810](https://github.com/dapr/dapr/pull/9810))
> **SDK requirement**: `Dapr.Workflow >= 1.18.0-rc01` ([dapr/dotnet-sdk#1802](https://github.com/dapr/dotnet-sdk/pull/1802))
> **Proposal**: [dapr/proposals#102](https://github.com/dapr/proposals/issues/102)

## What is workflow context propagation?

When a parent workflow calls a child workflow it can optionally attach a tamper-evident snapshot of its own execution history. The receiver reads that snapshot via `ctx.GetPropagatedHistory()` and inspects the returned `PropagatedHistory` entries — letting it verify that the correct upstream steps ran before it proceeds.

### Two propagation modes

| Mode | Enum value | What the receiver sees |
|------|-----------|----------------------|
| **Own history** | `HistoryPropagationScope.OwnHistory` | Only the direct caller's events |
| **Lineage** | `HistoryPropagationScope.Lineage` | Caller's events **plus** any ancestor history the caller itself received |

## Scenario: Credit-card payment with fraud detection

```
MerchantCheckout (root)
  └─ ValidateMerchant         (activity, no propagation)
  └─ ProcessPayment           (child wf, Lineage)
        └─ ValidateCard               (activity, no propagation)
        └─ CheckSpendingLimits        (activity, no propagation)
        └─ FraudDetection             (grandchild wf, Lineage)
        |      reads MerchantCheckout/ValidateMerchant
        |            ProcessPayment/ValidateCard
        |            ProcessPayment/CheckSpendingLimits
        └─ SettlementWorkflow         (grandchild wf, OwnHistory)
               reads ProcessPayment events only
               └─ SettlePayment       (activity)
```

`FraudDetection` uses `HistoryPropagationScope.Lineage` to see the **full ancestor chain** — it can verify both the merchant validation (performed by the grandparent) and the card/limit checks (performed by the parent) before approving the transaction.

`SettlementWorkflow` uses `HistoryPropagationScope.OwnHistory` to see only the **direct caller's events** — a trust-boundary mode that limits visibility to what `ProcessPayment` itself executed.

### .NET vs Python difference

The Python sibling ([dapr/quickstarts#1309](https://github.com/dapr/quickstarts/pull/1309)) calls `settle_payment` as a bare activity with `propagation=PropagationScope.OWN_HISTORY`. In the .NET SDK (v1.18) `HistoryPropagationScope` is only available on `ChildWorkflowTaskOptions` — activity calls do not carry a propagation scope. To demonstrate the identical trust-boundary semantics, this sample wraps the settlement activity inside `SettlementWorkflow` (a child workflow).

## .NET API surface

```csharp
// Parent workflow — propagate Lineage when calling a child workflow
var result = await ctx.CallChildWorkflowAsync<T>(
    nameof(FraudDetectionWorkflow),
    input,
    new ChildWorkflowTaskOptions(PropagationScope: HistoryPropagationScope.Lineage));

// Parent workflow — propagate OwnHistory when calling a child workflow
var settlement = await ctx.CallChildWorkflowAsync<T>(
    nameof(SettlementWorkflow),
    input,
    new ChildWorkflowTaskOptions(PropagationScope: HistoryPropagationScope.OwnHistory));

// Child workflow — read the propagated history
var history = ctx.GetPropagatedHistory();   // returns PropagatedHistory?

if (history is not null)
{
    // Filter to a specific ancestor workflow by name
    var processEntries = history.FilterByWorkflowName(nameof(ProcessPaymentWorkflow));

    // Inspect events within that ancestor's segment
    var completedCount = processEntries.Entries[0].Events
        .Count(e => e.Kind == HistoryEventKind.TaskCompleted);
}
```

Key types in `Dapr.Workflow`:
- `HistoryPropagationScope` — enum: `None`, `OwnHistory`, `Lineage`
- `ChildWorkflowTaskOptions` — pass `PropagationScope` here
- `PropagatedHistory` — call `.FilterByWorkflowName(name)`, `.FilterByAppId(id)`, `.FilterByInstanceId(id)`
- `PropagatedHistoryEntry` — has `WorkflowName`, `AppId`, `InstanceId`, `Events`
- `PropagatedHistoryEvent` — has `EventId`, `Kind` (`HistoryEventKind`), `Timestamp`
- `HistoryEventKind` — enum including `TaskScheduled`, `TaskCompleted`, `TaskFailed`, etc.

## Prerequisites

- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/) 1.18+
- Dapr runtime 1.18+ initialized (`dapr init`)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- Redis (started automatically by `dapr init`)

## Run the sample

```sh
cd workflows/csharp/sdk-context-propagation

dapr run -f .
```

## Expected output

```
============================================
= WORKFLOW HISTORY PROPAGATION DEMO (.NET) =
============================================

  Flow: MerchantCheckout -> ValidateMerchant
           -> ProcessPayment (child wf, Lineage)
               -> ValidateCard -> CheckSpendingLimits
               -> FraudDetection (child wf, Lineage)    <-- sees MerchantCheckout + ProcessPayment events
               -> SettlementWorkflow  (child wf, OwnHistory)  <-- sees only ProcessPayment events

  [main] Scheduling workflow instance: checkout-001
  [MerchantCheckout] Starting checkout for merchant merchant-abc
  [MerchantCheckout] Step 1: ValidateMerchant (no propagation)
  [ValidateMerchant] Validating merchant merchant-abc
  [MerchantCheckout] Step 1 complete: merchant valid
  [MerchantCheckout] Step 2: ProcessPayment child wf (HistoryPropagationScope.Lineage)
  [ProcessPayment] Starting payment ****4242 149.99 USD
  [ProcessPayment] Step 1: ValidateCard (no propagation)
  [ValidateCard] Validating card ****4242
  [ProcessPayment] Step 1 complete: card valid
  [ProcessPayment] Step 2: CheckSpendingLimits (no propagation)
  [CheckSpendingLimits] Checking 149.99 USD
  [CheckSpendingLimits] Within limits: True
  [ProcessPayment] Step 2 complete: within limits
  [ProcessPayment] Step 3: FraudDetection child wf (HistoryPropagationScope.Lineage)
  [FraudDetection] Checking payment ****4242 149.99 USD
  [FraudDetection] Received propagated history with 2 segment(s):
  [FraudDetection]   workflow: name=MerchantCheckoutWorkflow app=order-processor events=...
  [FraudDetection]   workflow: name=ProcessPaymentWorkflow app=order-processor events=...
  [FraudDetection] Verification:
    MerchantCheckout TaskCompleted events: 1
    ProcessPayment   TaskCompleted events: 2
  [FraudDetection] APPROVED (risk=0.10, total events inspected=...)
  [ProcessPayment] Step 3 complete: fraud check passed (risk=0.10)
  [ProcessPayment] Step 4: SettlementWorkflow child wf (HistoryPropagationScope.OwnHistory)
  [SettlementWorkflow] Propagated segments: 1
  [SettlementWorkflow]   workflow: name=ProcessPaymentWorkflow app=order-processor events=...
  [SettlementWorkflow] MerchantCheckout in history (expected 0): 0
  [SettlePayment] SETTLED: txn-merchant-abc-...
  [MerchantCheckout] COMPLETE: payment settled: txn=txn-merchant-abc-..., card=****4242, amount=149.99 USD
  [main] Workflow completed! Output: "payment settled: ..."

============================================
=               COMPLETE                  =
============================================
```

## References

- Sibling Python quickstart: [dapr/quickstarts#1309](https://github.com/dapr/quickstarts/pull/1309)
- Canonical Go SDK reference: [dapr/go-sdk#823](https://github.com/dapr/go-sdk/pull/823)
- .NET SDK implementation: [dapr/dotnet-sdk#1802](https://github.com/dapr/dotnet-sdk/pull/1802)
- Runtime support: [dapr/dapr#9810](https://github.com/dapr/dapr/pull/9810)
- Docs (.NET): [dapr/docs#5174](https://github.com/dapr/docs/pull/5174)
- Proposal: [dapr/proposals#102](https://github.com/dapr/proposals/issues/102)
- 1.18 endgame: [dapr/dapr#9856](https://github.com/dapr/dapr/issues/9856)
