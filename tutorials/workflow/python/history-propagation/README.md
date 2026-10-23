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
└── PrescribeMedication (child workflow, PropagationScope.LINEAGE)
    ├── CheckAllergies (activity, no propagation)
    ├── ScreenDrugInteractions (activity, no propagation)
    ├── ComplianceAudit (child workflow, PropagationScope.LINEAGE)
    │     → sees PatientIntake + PrescribeMedication events
    └── DispenseMedication (activity, PropagationScope.OWN_HISTORY)
          → sees PrescribeMedication events only
          → refuses to dispense if the screening lineage is missing
```

### Propagation scope

| Mode | What it sends | Use case |
|------|---------------|----------|
| `PropagationScope.LINEAGE` | Caller's own events + any ancestor events it received | Full chain-of-custody verification (compliance audits) |
| `PropagationScope.OWN_HISTORY` | Caller's own events only (no ancestor chain) | Trust boundary — downstream only sees the immediate caller (pharmacy dispense) |

### Scenarios

`ComplianceAudit` always runs with `PropagationScope.LINEAGE`, so it sees the
full ancestor chain — `VerifyInsurance` from PatientIntake plus `CheckAllergies`
and `ScreenDrugInteractions` from PrescribeMedication — and approves only when
every upstream check completed. The demo then runs `DispenseMedication` twice
to show the `OWN_HISTORY` trust boundary in action:

1. **Lineage forwarded → pharmacy dispenses.** `PrescribeMedication` calls
   `DispenseMedication` with `PropagationScope.OWN_HISTORY`. The pharmacy sees
   PrescribeMedication's screening events — but not the PatientIntake chain —
   and fills the prescription.

2. **Lineage withheld → pharmacy refuses.** `PrescribeMedication` calls
   `DispenseMedication` **without** history propagation. With no propagated
   history to prove the prescription was screened, the pharmacy refuses to
   dispense and returns a `refused` result explaining what was missing.

## Python API surface

```python
# Parent workflow — propagate LINEAGE when calling a child workflow
result = yield ctx.call_child_workflow(
    compliance_audit,
    input=rec_json,
    propagation=wf.PropagationScope.LINEAGE,
)

# Parent workflow — propagate OWN_HISTORY when calling an activity
dispense = yield ctx.call_activity(
    dispense_medication,
    input=rec_json,
    propagation=wf.PropagationScope.OWN_HISTORY,
)

# Child workflow (or activity) — read the propagated history
history = ctx.get_propagated_history()  # PropagatedHistory | None

if history is not None:
    intake_wf  = history.get_last_workflow_by_name('PatientIntake')
    insurance  = intake_wf.get_last_activity_by_name('VerifyInsurance')
    print(insurance.completed)  # bool
    print(insurance.output)     # JSON string
```

Key symbols exported from `dapr.ext.workflow`:

- `PropagationScope` — enum with `LINEAGE` and `OWN_HISTORY`
- `PropagatedHistory` — top-level history object; `.get_workflows()`,
  `.get_last_workflow_by_name(name)`, `.events`, `.scope`, `.get_app_ids()`
- `WorkflowResult` — per-workflow slice; `.get_last_activity_by_name(name)`
- `ActivityResult` — `.completed`, `.output`
- `PropagationNotFoundError` — raised when a named workflow/activity is
  not present in the history

> **Replay safety:** workflow code runs many times during durable
> execution. Guard side-effecting calls — including `print()` — with
> `if not ctx.is_replaying:` so they only fire on the live execution.

## Running this example

Requires Dapr `1.18+`.

Install the Python dependencies:

<!-- STEP
name: Install dependencies
expected_stdout_lines:
  - "patient-intake deps OK"
output_match_mode: substring
background: false
timeout_seconds: 180
-->

```bash
pip3 install -r requirements.txt && echo "patient-intake deps OK"
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

In standalone mode the sidecar logs `propagating unsigned workflow history to ...`
warnings — these are expected and harmless for a local `dapr run` demo.
