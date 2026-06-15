# Workflow History Propagation

This tutorial demonstrates **workflow history propagation**, a Dapr 1.18+ feature that lets a parent workflow share its execution history with child workflows and activities. Downstream services can inspect the propagated history to make trust-aware decisions — without any external state store or custom messaging. See the [Workflow history propagation](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-history-propagation/) for the feature reference.

## Scenario: Patient intake / e-prescribing

A `ComplianceAuditWorkflow` and a `DispenseMedicationActivity` refuse to act unless the propagated history proves the required upstream checks (insurance, allergies, drug interactions) actually ran.

```mermaid
graph LR
  SI((Start))
  PI[PatientIntakeWorkflow]
  VI[VerifyInsurance]
  PM[PrescribeMedicationWorkflow]
  CA[CheckAllergies]
  SD[ScreenDrugInteractions]
  CO[ComplianceAuditWorkflow]
  DM[DispenseMedication]
  EW((End))
  SI --> PI
  PI -->|no propagation| VI
  PI -->|LINEAGE| PM
  PM -->|no propagation| CA
  PM -->|no propagation| SD
  PM -->|LINEAGE| CO
  PM -->|OWN_HISTORY| DM
  CO --> DM
  DM --> EW
```

- `PatientIntakeWorkflow` (root) calls `VerifyInsuranceActivity` (no propagation), then invokes `PrescribeMedicationWorkflow` with `propagateLineage()`.
- `PrescribeMedicationWorkflow` receives `scope=LINEAGE` with **1 ancestor** (PatientIntake). It runs allergy and interaction checks, then calls `ComplianceAuditWorkflow` with `propagateLineage()` and `DispenseMedicationActivity` with `propagateOwnHistory()`.
- `ComplianceAuditWorkflow` receives `scope=LINEAGE` with **2 ancestors** (PatientIntake + PrescribeMedication). It uses `getLastActivityByName(...)` to verify each required upstream activity completed, then approves.
- `DispenseMedicationActivity` receives `scope=OWN_HISTORY` with **1 ancestor** (PrescribeMedication only). The grandparent PatientIntake is intentionally not visible (trust boundary).

## Java API surface

```java
import io.dapr.durabletask.ActivityResult;
import io.dapr.durabletask.HistoryPropagationScope;
import io.dapr.durabletask.PropagatedHistory;
import io.dapr.durabletask.WorkflowResult;
import io.dapr.workflows.WorkflowTaskOptions;

// Parent — propagate LINEAGE when calling a child workflow
AuditResult audit = ctx.callChildWorkflow(
    ComplianceAuditWorkflow.class.getName(),
    rec,
    /* instanceId */ null,
    WorkflowTaskOptions.propagateLineage(),
    AuditResult.class).await();

// Parent — propagate OWN_HISTORY when calling an activity
DispenseResult dispense = ctx.callActivity(
    DispenseMedicationActivity.class.getName(),
    rec,
    WorkflowTaskOptions.propagateOwnHistory(),
    DispenseResult.class).await();

// Receiver (child workflow or activity) — read the propagated history
Optional<PropagatedHistory> historyOpt = ctx.getPropagatedHistory();
historyOpt.ifPresent(history -> {
    history.getScope();         // HistoryPropagationScope (LINEAGE | OWN_HISTORY)
    history.getWorkflows();     // List<WorkflowResult> — ancestor first, then own

    Optional<WorkflowResult> intake = history.getLastWorkflowByName(
        PatientIntakeWorkflow.class.getName());
    intake.flatMap(wf -> wf.getLastActivityByName(VerifyInsuranceActivity.class.getName()))
          .map(ActivityResult::isCompleted);
});
```

## Run the tutorial

1. Use a terminal to navigate to the `tutorials/workflow/java/history-propagation` folder.

2. Build and run the project using Maven. This spins up a Dapr sidecar via Testcontainers.

    <!-- STEP
    name: Start the application
    expected_stdout_lines:
      - 'Started HistoryPropagationApplication'
    output_match_mode: substring
    background: true
    sleep: 90
    timeout_seconds: 240
    -->

    ```bash
    mvn spring-boot:test-run
    ```

    <!-- END_STEP -->

### Scenario 1 (happy path): lineage forwarded — pharmacy dispenses

3. Run scenario 1 — the first POST request in the [`history-propagation.http`](./history-propagation.http) file, then poll the output endpoint:

    <!-- STEP
    name: Scenario 1 - lineage forwarded
    expected_stdout_lines:
      - '"dispensed":true'
      - '"medication":"amoxicillin"'
    output_match_mode: substring
    timeout_seconds: 90
    -->

    ```bash
    curl -s -X POST http://localhost:8080/start \
      -H 'content-type: application/json' \
      -d '{"patientId":"P-1042","name":"Jane Doe","condition":"bacterial sinusitis","medication":"amoxicillin","dosage":500,"propagateHistory":true}'
    echo ""
    for i in $(seq 1 30); do
      OUT=$(curl -s http://localhost:8080/output)
      if echo "$OUT" | grep -q '"medication":"amoxicillin"'; then
        echo "$OUT"
        break
      fi
      sleep 2
    done
    ```

    <!-- END_STEP -->

    The app logs show the propagation markers proving the feature works:

    ```text
    i.d.s.e.h.PatientIntakeWorkflow         : PROPAGATION-DEMO: root workflow received no propagated history (expected)
    i.d.s.e.h.PrescribeMedicationWorkflow   : PROPAGATION-DEMO: scope=LINEAGE workflows=1
    i.d.s.e.h.ComplianceAuditWorkflow       : PROPAGATION-DEMO: scope=LINEAGE workflows=2
    i.d.s.e.h.ComplianceAuditWorkflow       :   upstream activity VerifyInsurance: completed=true
    i.d.s.e.h.ComplianceAuditWorkflow       :   upstream activity CheckAllergies: completed=true
    i.d.s.e.h.ComplianceAuditWorkflow       :   upstream activity ScreenDrugInteractions: completed=true
    i.d.s.e.h.ComplianceAuditWorkflow       : APPROVED (risk=0.10, 2 workflow(s) verified)
    i.d.s.e.h.a.DispenseMedicationActivity  : PROPAGATION-DEMO: scope=OWN_HISTORY workflows=1
    i.d.s.e.h.a.DispenseMedicationActivity  : DISPENSED: rx-P-1042-... (amoxicillin 500mg) for patient P-1042
    ```

    The GET /output response is:

    ```json
    {"dispensed":true,"dispenseId":"rx-P-1042-<ts>","patientId":"P-1042","medication":"amoxicillin"}
    ```

### Scenario 2 (failure): lineage withheld — pharmacy refuses

When `propagateHistory` is `false`, `PatientIntakeWorkflow` invokes `PrescribeMedicationWorkflow` **without** propagation options. `ComplianceAuditWorkflow` then receives no PatientIntake events in its propagated history, can't verify `VerifyInsurance` ran, and blocks the prescription.

4. Run scenario 2 — the second POST request, polling the output endpoint until the failed result lands:

    <!-- STEP
    name: Scenario 2 - lineage withheld
    expected_stdout_lines:
      - '"dispensed":false'
      - '"medication":"penicillin"'
    output_match_mode: substring
    timeout_seconds: 90
    -->

    ```bash
    curl -s -X POST http://localhost:8080/start \
      -H 'content-type: application/json' \
      -d '{"patientId":"P-2087","name":"John Roe","condition":"strep throat","medication":"penicillin","dosage":500,"propagateHistory":false}'
    echo ""
    for i in $(seq 1 30); do
      OUT=$(curl -s http://localhost:8080/output)
      if echo "$OUT" | grep -q '"medication":"penicillin"'; then
        echo "$OUT"
        break
      fi
      sleep 2
    done
    ```

    <!-- END_STEP -->

    The app logs show the audit failing because it cannot find the upstream `VerifyInsurance` activity in the propagated history:

    ```text
    i.d.s.e.h.PatientIntakeWorkflow         : Calling PrescribeMedicationWorkflow WITHOUT propagation (failure scenario)
    i.d.s.e.h.PrescribeMedicationWorkflow   : Starting prescription: penicillin 500mg for strep throat
    i.d.s.e.h.ComplianceAuditWorkflow       : PROPAGATION-DEMO: scope=LINEAGE workflows=1
    i.d.s.e.h.ComplianceAuditWorkflow       :   upstream activity VerifyInsurance: completed=false
    i.d.s.e.h.ComplianceAuditWorkflow       :   upstream activity CheckAllergies: completed=true
    i.d.s.e.h.ComplianceAuditWorkflow       :   upstream activity ScreenDrugInteractions: completed=true
    i.d.s.e.h.ComplianceAuditWorkflow       : BLOCKED - missing upstream checks: insurance=false allergies=true interactions=true
    i.d.s.e.h.PrescribeMedicationWorkflow   : Audit blocked dispensing - aborting prescription
    ```

    The GET /output response is:

    ```json
    {"dispensed":false,"dispenseId":null,"patientId":"P-2087","medication":"penicillin"}
    ```

5. Stop the application by pressing `Ctrl+C`.
