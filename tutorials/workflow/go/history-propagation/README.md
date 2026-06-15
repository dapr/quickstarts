# Dapr Workflow History Propagation — Patient Intake

This example demonstrates how Dapr workflows can propagate their execution
history to child workflows and activities, so downstream consumers can
inspect the full (or partial) execution context of their caller. See the
[Workflow history propagation](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-history-propagation/)
docs for the concept overview.

The scenario is a patient intake / e-prescribing pipeline: a compliance
audit and a pharmacy dispense step refuse to act unless they can see
proof — in the propagated history — that the required upstream checks
(insurance, allergies, drug interactions) actually ran.

## Workflow architecture

```
PatientIntake (workflow)
├── VerifyInsurance (activity, no propagation)
└── PrescribeMedication (child workflow, PropagateLineage)
    ├── CheckAllergies (activity, no propagation)
    ├── ScreenDrugInteractions (activity, no propagation)
    ├── ComplianceAudit (child workflow, PropagateLineage)
    │     → sees PatientIntake + PrescribeMedication events
    └── DispenseMedication (activity, PropagateOwnHistory)
          → sees PrescribeMedication events only
          → refuses to dispense if the screening lineage is missing
```

### Propagation scope

| Mode | What it sends | Use case |
|------|---------------|----------|
| `PropagateLineage()` | Caller's own events + any ancestor events it received | Full chain-of-custody verification (compliance audits) |
| `PropagateOwnHistory()` | Caller's own events only (no ancestor chain) | Trust boundary — downstream only sees the immediate caller (pharmacy dispense) |

### Key demonstration

- **ComplianceAudit** receives the full lineage via `PropagateLineage()` —
  it verifies that `VerifyInsurance` ran in the grandparent workflow
  (PatientIntake), plus `CheckAllergies` and `ScreenDrugInteractions`
  ran in PrescribeMedication.

- **DispenseMedication** receives only PrescribeMedication's history via
  `PropagateOwnHistory()`. The PatientIntake ancestral history is excluded
  — the pharmacy system doesn't need (or get to see) the upstream chain.
  Before dispensing, the pharmacy verifies that `CheckAllergies` and
  `ScreenDrugInteractions` completed in the propagated history.

### Scenarios

The demo runs two scenarios back-to-back to show both the happy path and
the pharmacy's safety check:

1. **Lineage forwarded → pharmacy dispenses.** `PrescribeMedication` calls
   `DispenseMedication` with `PropagateOwnHistory()`. The pharmacy sees the
   completed allergy and interaction screens in the propagated history and
   fills the prescription.

2. **Lineage withheld → pharmacy refuses.** `PrescribeMedication` calls
   `DispenseMedication` **without** history propagation (simulating an
   upstream system that fails to forward its lineage). With no propagated
   history to prove the prescription was screened, the pharmacy refuses to
   dispense and returns a `refused` result explaining what was missing.

## Running this example

Requires Dapr `1.18.0+` (workflow history propagation), `go-sdk v1.15.0+`,
and `durabletask-go v0.12.0+`.

Build the example:

<!-- STEP
name: Build patient-intake
expected_stdout_lines:
  - "patient-intake build OK"
output_match_mode: substring
background: false
timeout_seconds: 180
-->

```bash
go build -o patient-app . && echo "patient-intake build OK"
```

<!-- END_STEP -->

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
[ComplianceAudit] Received propagated history: 15 events (scope: LINEAGE)
[ComplianceAudit] APPROVED (risk=0.10)
[DispenseMedication] Dispense request: amoxicillin 500mg ... (propagated history: 12 events, scope=OWN_HISTORY)
[DispenseMedication] DISPENSED: rx-P-1042-...
```

In scenario 2 (lineage withheld) the pharmacy refuses:

```
[PrescribeMedication] Step 4: CallActivity(DispenseMedication)
                      -> NO history propagation (negative scenario)
[DispenseMedication] Dispense request: penicillin 500mg ... (propagated history: none)
[DispenseMedication] REFUSED — no propagated history; cannot verify screening for P-2087
[PrescribeMedication] Step 4 BLOCKED: pharmacy refused to dispense (missing lineage: no propagated history received from prescriber)
```

In standalone mode the sidecar will log
`propagating unsigned workflow history to ...` warnings — these are
expected. Without `WorkflowHistorySigning` enabled, propagated history
chunks aren't cryptographically signed, which is fine for a local
`dapr run` demo. Signing the chunks within an mTLS trust boundary is a
production concern handled at the cluster/control-plane level and is out
of scope for this quickstart. 


## Files

```
history-propagation/
├── README.md      # this file
├── dapr.yaml      # `dapr run -f .` config (appID, resources, command)
├── makefile       # wires the example into `make validate`
├── main.go        # registry + worker setup, schedules both scenarios
├── models.go      # PatientRecord, ComplianceResult, DispenseResult
├── workflow.go    # workflow + activity definitions, history helpers
├── go.mod         # module + deps
└── go.sum
```
