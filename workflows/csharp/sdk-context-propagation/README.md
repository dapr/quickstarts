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

## Scenario: Patient intake / e-prescribing

A compliance audit and a pharmacy dispense step refuse to act unless the propagated history proves the required upstream checks (insurance, allergies, drug interactions) actually ran.

```
PatientIntake (root)
  └─ VerifyInsurance         (activity, no propagation)
  └─ PrescribeMedication     (child wf, Lineage)
        └─ CheckAllergies                 (activity, no propagation)
        └─ ScreenDrugInteractions         (activity, no propagation)
        └─ ComplianceAudit                (grandchild wf, Lineage)
        |      reads PatientIntake/VerifyInsurance
        |            PrescribeMedication/CheckAllergies
        |            PrescribeMedication/ScreenDrugInteractions
        └─ DispenseMedicationWorkflow     (grandchild wf, OwnHistory)
               reads PrescribeMedication events only
               └─ DispenseMedication       (activity)
```

`ComplianceAudit` uses `HistoryPropagationScope.Lineage` to see the **full ancestor chain** — it can verify both the insurance check (performed by the grandparent `PatientIntake`) and the allergy/interaction checks (performed by the parent `PrescribeMedication`) before approving the prescription.

`DispenseMedicationWorkflow` uses `HistoryPropagationScope.OwnHistory` to see only the **direct caller's events** — a trust-boundary mode that limits visibility to what `PrescribeMedication` itself executed. The pharmacy dispense system doesn't need (or get to see) the upstream patient-intake chain.

This sample mirrors the canonical Go reference [dapr/go-sdk#823](https://github.com/dapr/go-sdk/pull/823) and the [Go quickstart](https://github.com/dapr/quickstarts/pull/1315).

### .NET vs Python/Go difference

The Python sibling ([dapr/quickstarts#1309](https://github.com/dapr/quickstarts/pull/1309)) and the Go reference call the final dispense step as a bare activity with an `OwnHistory` propagation argument. In the .NET SDK (v1.18) `HistoryPropagationScope` is only available on `ChildWorkflowTaskOptions` — activity calls do not carry a propagation scope. To demonstrate the identical trust-boundary semantics, this sample wraps the `DispenseMedicationActivity` inside `DispenseMedicationWorkflow` (a child workflow).

## .NET API surface

```csharp
// Parent workflow — propagate Lineage when calling a child workflow
var result = await ctx.CallChildWorkflowAsync<T>(
    nameof(ComplianceAuditWorkflow),
    input,
    new ChildWorkflowTaskOptions(PropagationScope: HistoryPropagationScope.Lineage));

// Parent workflow — propagate OwnHistory when calling a child workflow
var dispense = await ctx.CallChildWorkflowAsync<T>(
    nameof(DispenseMedicationWorkflow),
    input,
    new ChildWorkflowTaskOptions(PropagationScope: HistoryPropagationScope.OwnHistory));

// Child workflow — read the propagated history
var history = ctx.GetPropagatedHistory();   // returns PropagatedHistory?

if (history is not null)
{
    // Filter to a specific ancestor workflow by name
    var prescribeEntries = history.FilterByWorkflowName(nameof(PrescribeMedicationWorkflow));

    // Inspect events within that ancestor's segment
    var completedCount = prescribeEntries.Entries[0].Events
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

> **Replay safety**: workflow code runs many times during durable execution. Guard side-effecting calls — including `Console.WriteLine` — with `if (!ctx.IsReplaying)` so they only fire on the live execution, not on each replay.

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
================================================================
= WORKFLOW HISTORY PROPAGATION DEMO — PATIENT INTAKE (.NET)   =
================================================================

  Flow: PatientIntake -> VerifyInsurance
           -> PrescribeMedication (child wf, Lineage)
               -> CheckAllergies -> ScreenDrugInteractions
               -> ComplianceAudit              (child wf, Lineage)    <-- sees PatientIntake + PrescribeMedication events
               -> DispenseMedicationWorkflow   (child wf, OwnHistory) <-- sees only PrescribeMedication events

  [main] Scheduling workflow instance: intake-001
  [PatientIntake] Starting intake for patient P-1042
  [PatientIntake] Step 1: VerifyInsurance (no propagation)
  [VerifyInsurance] Checking coverage for patient P-1042
  [PatientIntake] Step 1 complete: insurance verified
  [PatientIntake] Step 2: PrescribeMedication child wf (HistoryPropagationScope.Lineage)
  [PrescribeMedication] Starting prescription: amoxicillin 500mg for bacterial sinusitis
  [PrescribeMedication] Step 1: CheckAllergies (no propagation)
  [CheckAllergies] Screening P-1042 for amoxicillin
  [PrescribeMedication] Step 1 complete: allergy clear
  [PrescribeMedication] Step 2: ScreenDrugInteractions (no propagation)
  [ScreenDrugInteractions] Screening amoxicillin 500mg for P-1042
  [PrescribeMedication] Step 2 complete: no interactions
  [PrescribeMedication] Step 3: ComplianceAudit child wf (HistoryPropagationScope.Lineage)
  [ComplianceAudit] Auditing prescription for patient P-1042
  [ComplianceAudit] Received propagated history with 2 segment(s):
  [ComplianceAudit]   workflow: name=PatientIntakeWorkflow app=order-processor events=...
  [ComplianceAudit]   workflow: name=PrescribeMedicationWorkflow app=order-processor events=...
  [ComplianceAudit] Verification:
    PatientIntake       TaskCompleted events: 1 (expect >= 1: VerifyInsurance)
    PrescribeMedication TaskCompleted events: 2 (expect >= 2: CheckAllergies, ScreenDrugInteractions)
  [ComplianceAudit] APPROVED (risk=0.10, total events inspected=...)
  [PrescribeMedication] Step 3 complete: compliance audit passed (risk=0.10)
  [PrescribeMedication] Step 4: DispenseMedicationWorkflow child wf (HistoryPropagationScope.OwnHistory)
  [DispenseMedicationWorkflow] Propagated segments: 1
  [DispenseMedicationWorkflow]   workflow: name=PrescribeMedicationWorkflow app=order-processor events=...
  [DispenseMedicationWorkflow]     event: kind=ExecutionStarted id=...
  [DispenseMedicationWorkflow]     event: kind=TaskScheduled id=...
  [DispenseMedicationWorkflow]     event: kind=TaskCompleted id=...
  [DispenseMedicationWorkflow] PatientIntake in history (expected 0): 0
  [DispenseMedication] DISPENSED: rx-P-1042-... (amoxicillin 500mg)
  [PrescribeMedication] Step 4 complete: dispensed (id=rx-P-1042-...)
  [PrescribeMedication] COMPLETE: dispensed: id=rx-P-1042-..., patient=P-1042, drug=amoxicillin 500mg
  [PatientIntake] COMPLETE: dispensed: id=rx-P-1042-..., patient=P-1042, drug=amoxicillin 500mg
  [main] Workflow completed! Output: "dispensed: ..."

================================================================
=                          COMPLETE                            =
================================================================
```

## Standalone-mode note

In standalone mode the sidecar will log `propagating unsigned workflow history to ...` warnings — these are expected. Without `WorkflowHistorySigning` enabled, propagated history chunks aren't cryptographically signed, which is fine for a local `dapr run` demo. Signing the chunks within an mTLS trust boundary is a production concern handled at the cluster/control-plane level and is out of scope for this quickstart.

## References

- Sibling Python quickstart: [dapr/quickstarts#1309](https://github.com/dapr/quickstarts/pull/1309)
- Canonical Go SDK reference: [dapr/go-sdk#823](https://github.com/dapr/go-sdk/pull/823)
- Sibling Go quickstart: [dapr/quickstarts#1315](https://github.com/dapr/quickstarts/pull/1315)
- .NET SDK implementation: [dapr/dotnet-sdk#1802](https://github.com/dapr/dotnet-sdk/pull/1802)
- Runtime support: [dapr/dapr#9810](https://github.com/dapr/dapr/pull/9810)
- Docs (.NET): [dapr/docs#5174](https://github.com/dapr/docs/pull/5174)
- Proposal: [dapr/proposals#102](https://github.com/dapr/proposals/issues/102)
- 1.18 endgame: [dapr/dapr#9856](https://github.com/dapr/dapr/issues/9856)
