# Dapr Workflow History Propagation — Patient Intake (.NET SDK)

This quickstart demonstrates **workflow history propagation**, a Dapr 1.18
feature that lets a workflow propagate its execution history to child workflows
so downstream consumers can inspect the full (or partial) execution context of
their caller — without any external state store or custom messaging.

The scenario is a patient intake / e-prescribing pipeline: a compliance audit
and a pharmacy dispense step refuse to act unless they can see proof — in the
propagated history — that the required upstream checks (insurance, allergies,
drug interactions) actually ran.

> **Runtime requirement**: Dapr 1.18+ ([dapr/dapr#9810](https://github.com/dapr/dapr/pull/9810))
> **SDK requirement**: `Dapr.Workflow >= 1.18.0-rc01` ([dapr/dotnet-sdk#1802](https://github.com/dapr/dotnet-sdk/pull/1802))
> **Proposal**: [dapr/proposals#102](https://github.com/dapr/proposals/issues/102)

## Workflow architecture

```
PatientIntake (workflow)
├── VerifyInsurance (activity, no propagation)
└── PrescribeMedication (child workflow, Lineage)
    ├── CheckAllergies (activity, no propagation)
    ├── ScreenDrugInteractions (activity, no propagation)
    ├── ComplianceAudit (child workflow, Lineage)
    │     → sees PatientIntake + PrescribeMedication events
    └── DispenseMedicationWorkflow (child workflow, OwnHistory)
          → sees PrescribeMedication events only
          → refuses to dispense if the screening lineage is missing
```

### Propagation scope

| Mode | Enum value | What it sends | Use case |
|------|-----------|---------------|----------|
| **Lineage** | `HistoryPropagationScope.Lineage` | Caller's own events + any ancestor events it received | Full chain-of-custody verification (compliance audits) |
| **Own history** | `HistoryPropagationScope.OwnHistory` | Caller's own events only (no ancestor chain) | Trust boundary — downstream only sees the immediate caller (pharmacy dispense) |

### Key demonstration

- **ComplianceAudit** receives the full lineage via `HistoryPropagationScope.Lineage` —
  it verifies that `VerifyInsurance` ran in the grandparent workflow
  (PatientIntake), plus `CheckAllergies` and `ScreenDrugInteractions` ran in
  PrescribeMedication.

- **DispenseMedicationWorkflow** receives only PrescribeMedication's history via
  `HistoryPropagationScope.OwnHistory`. The PatientIntake ancestral history is
  excluded — the pharmacy system doesn't need (or get to see) the upstream
  chain. Before dispensing, the pharmacy verifies that `CheckAllergies` and
  `ScreenDrugInteractions` completed in the propagated history.

### Scenarios

The demo runs two scenarios back-to-back to show both the happy path and the
pharmacy's safety check:

1. **Lineage forwarded → pharmacy dispenses.** `PrescribeMedication` calls the
   dispense step with `HistoryPropagationScope.OwnHistory`. The pharmacy sees
   the completed allergy and interaction screens in the propagated history and
   fills the prescription.

2. **Lineage withheld → pharmacy refuses.** `PrescribeMedication` calls the
   dispense step **without** history propagation (simulating an upstream system
   that fails to forward its lineage). With no propagated history to prove the
   prescription was screened, the pharmacy refuses to dispense and returns a
   `refused` result explaining what was missing.

## .NET note: dispense is a child workflow

The Python sibling ([dapr/quickstarts#1309](https://github.com/dapr/quickstarts/pull/1309))
and the Go reference call the final dispense step as a bare **activity** with an
`OwnHistory` propagation argument. In the .NET SDK (v1.18)
`HistoryPropagationScope` is only available on `ChildWorkflowTaskOptions` —
activity calls do not carry a propagation scope. To demonstrate the identical
trust-boundary semantics, this sample wraps the `DispenseMedicationActivity`
inside `DispenseMedicationWorkflow` (a child workflow) which inspects the
propagated history and only calls the activity once it has verified the
screening lineage.

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

> **Replay safety**: workflow code runs many times during durable execution.
> Guard side-effecting calls — including `Console.WriteLine` — with
> `if (!ctx.IsReplaying)` so they only fire on the live execution, not on each
> replay.

## Running this example

Requires Dapr `1.18.0+` (workflow history propagation),
`Dapr.Workflow 1.18.0-rc01+`, and the [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
(or newer). Redis is started automatically by `dapr init`.

Build the example:

```bash
dotnet build ./order-processor
```

Run the demo:

<!-- STEP
name: Run history-propagation demo
expected_stdout_lines:
  - "SCENARIO 1: lineage forwarded"
  - "[ComplianceAudit] APPROVED"
  - "[DispenseMedication] DISPENSED"
  - "SCENARIO 2: lineage withheld"
  - "[DispenseMedication] REFUSED"
  - "pharmacy refused to dispense"
  - "missing lineage: no propagated history received from prescriber"
output_match_mode: substring
background: false
timeout_seconds: 180
sleep: 15
-->

```bash
dapr run -f .
```

<!-- END_STEP -->

The app runs both scenarios once and exits on its own — no Ctrl+C needed.

In scenario 1 (lineage forwarded) you'll see the pharmacy dispense:

```
[ComplianceAudit] Received propagated history with 2 segment(s):
[ComplianceAudit] APPROVED (risk=0.10, total events inspected=...)
[DispenseMedication] Dispense request: amoxicillin 500mg for P-1042 (propagated history: ... events)
[DispenseMedication] DISPENSED: rx-P-1042-...
```

In scenario 2 (lineage withheld) the pharmacy refuses:

```
[PrescribeMedication] Step 4: DispenseMedicationWorkflow child wf
                      -> NO history propagation (negative scenario)
[DispenseMedication] Dispense request: penicillin 500mg for P-2087 (propagated history: none)
[DispenseMedication] REFUSED — no propagated history; cannot verify screening for P-2087
[PrescribeMedication] Step 4 BLOCKED: pharmacy refused to dispense (missing lineage: no propagated history received from prescriber)
```

## Standalone-mode note

In standalone mode the sidecar will log `propagating unsigned workflow history
to ...` warnings — these are expected. Without `WorkflowHistorySigning` enabled,
propagated history chunks aren't cryptographically signed, which is fine for a
local `dapr run` demo. Signing the chunks within an mTLS trust boundary is a
production concern handled at the cluster/control-plane level and is out of
scope for this quickstart.

## Files

```
sdk-context-propagation/
├── README.md                       # this file
├── dapr.yaml                       # `dapr run -f .` config (appID, resources, command)
└── order-processor/
    ├── Program.cs                  # host setup; schedules both scenarios
    ├── Models.cs                   # PatientRecord, ComplianceResult, DispenseResult
    ├── Activities.cs               # VerifyInsurance, CheckAllergies, ScreenDrugInteractions, DispenseMedication
    ├── Workflows.cs                # workflow definitions + history inspection
    └── OrderProcessor.csproj       # project + Dapr.Workflow dependency
```

## References

- Sibling Python quickstart: [dapr/quickstarts#1309](https://github.com/dapr/quickstarts/pull/1309)
- Canonical Go SDK reference: [dapr/go-sdk#823](https://github.com/dapr/go-sdk/pull/823)
- Sibling Go quickstart: [dapr/quickstarts#1315](https://github.com/dapr/quickstarts/pull/1315)
- .NET SDK implementation: [dapr/dotnet-sdk#1802](https://github.com/dapr/dotnet-sdk/pull/1802)
- Runtime support: [dapr/dapr#9810](https://github.com/dapr/dapr/pull/9810)
- Docs (.NET): [dapr/docs#5174](https://github.com/dapr/docs/pull/5174)
- Proposal: [dapr/proposals#102](https://github.com/dapr/proposals/issues/102)
- 1.18 endgame: [dapr/dapr#9856](https://github.com/dapr/dapr/issues/9856)
```
