package main

import (
	"fmt"
	"strings"
	"time"

	"github.com/dapr/durabletask-go/api/protos"
	"github.com/dapr/durabletask-go/workflow"
)

// PatientIntake is the top-level workflow. It verifies the patient's
// insurance, then calls PrescribeMedication as a child workflow with
// PropagateLineage(), giving PrescribeMedication ancestral history to
// forward (or not) downstream.
func PatientIntake(ctx *workflow.WorkflowContext) (any, error) {
	var rec PatientRecord
	if err := ctx.GetInput(&rec); err != nil {
		return nil, err
	}

	if !ctx.IsReplaying() {
		fmt.Printf("  [PatientIntake] Starting intake for patient %s\n", rec.PatientID)
		fmt.Println("  [PatientIntake] Step 1: CallActivity(VerifyInsurance) — no propagation")
	}
	var insured bool
	if err := ctx.CallActivity(VerifyInsurance,
		workflow.WithActivityInput(rec),
	).Await(&insured); err != nil {
		return nil, fmt.Errorf("insurance verification failed: %w", err)
	}
	if !insured {
		return "intake declined: insurance not on file", nil
	}
	if !ctx.IsReplaying() {
		fmt.Println("  [PatientIntake] Step 1 complete: insurance verified")
		fmt.Println("  [PatientIntake] Step 2: CallChildWorkflow(PrescribeMedication)")
		fmt.Println("                  -> WithHistoryPropagation(PropagateLineage)")
	}
	var result string
	if err := ctx.CallChildWorkflow(PrescribeMedication,
		workflow.WithChildWorkflowInput(rec),
		workflow.WithHistoryPropagation(
			workflow.PropagateLineage()),
	).Await(&result); err != nil {
		return nil, fmt.Errorf("prescribing failed: %w", err)
	}
	if !ctx.IsReplaying() {
		fmt.Printf("  [PatientIntake] COMPLETE: %s\n", result)
	}
	return result, nil
}

// VerifyInsurance checks that the patient has active coverage on file.
func VerifyInsurance(ctx workflow.ActivityContext) (any, error) {
	var rec PatientRecord
	if err := ctx.GetInput(&rec); err != nil {
		return false, err
	}
	fmt.Printf("  [VerifyInsurance] Checking coverage for patient %s\n", rec.PatientID)
	return true, nil
}

// PrescribeMedication orchestrates an e-prescription. It checks the patient's
// allergies, screens for drug interactions, runs a compliance audit (as a
// child wf with full lineage), and dispenses the medication (as an activity
// with workflow-level propagation only).
func PrescribeMedication(ctx *workflow.WorkflowContext) (any, error) {
	var rec PatientRecord
	if err := ctx.GetInput(&rec); err != nil {
		return nil, err
	}

	if !ctx.IsReplaying() {
		fmt.Printf("  [PrescribeMedication] Starting prescription: %s %.0fmg for %s\n",
			rec.Medication, rec.Dosage, rec.Condition)
	}

	// Step 1: Allergy check (no propagation — plain activity)
	if !ctx.IsReplaying() {
		fmt.Println("  [PrescribeMedication] Step 1: CallActivity(CheckAllergies) — no propagation")
	}
	var allergyClear bool
	if err := ctx.CallActivity(CheckAllergies,
		workflow.WithActivityInput(rec),
	).Await(&allergyClear); err != nil {
		return nil, fmt.Errorf("allergy check failed: %w", err)
	}
	if !allergyClear {
		return "prescription declined: known allergy", nil
	}
	if !ctx.IsReplaying() {
		fmt.Println("  [PrescribeMedication] Step 1 complete: allergy clear")
	}

	// Step 2: Drug interaction screen (no propagation — plain activity)
	if !ctx.IsReplaying() {
		fmt.Println("  [PrescribeMedication] Step 2: CallActivity(ScreenDrugInteractions) — no propagation")
	}
	var interactionsClear bool
	if err := ctx.CallActivity(ScreenDrugInteractions,
		workflow.WithActivityInput(rec),
	).Await(&interactionsClear); err != nil {
		return nil, fmt.Errorf("drug interaction screen failed: %w", err)
	}
	if !interactionsClear {
		return "prescription declined: drug interaction risk", nil
	}
	if !ctx.IsReplaying() {
		fmt.Println("  [PrescribeMedication] Step 2 complete: no interactions")
	}

	// Step 3: Compliance audit as a child wf.
	// PropagateLineage() — include our events AND any ancestral history we received
	if !ctx.IsReplaying() {
		fmt.Println("  [PrescribeMedication] Step 3: CallChildWorkflow(ComplianceAudit)")
		fmt.Println("                        -> WithHistoryPropagation(PropagateLineage)")
	}
	var compliance ComplianceResult
	if err := ctx.CallChildWorkflow(ComplianceAudit,
		workflow.WithChildWorkflowInput(rec),
		workflow.WithHistoryPropagation(workflow.PropagateLineage()),
	).Await(&compliance); err != nil {
		return nil, fmt.Errorf("compliance audit failed: %w", err)
	}
	if !compliance.Compliant {
		return fmt.Sprintf("prescription blocked: compliance audit failed (risk=%.2f, reason=%s)",
			compliance.RiskScore, compliance.Reason), nil
	}
	if !ctx.IsReplaying() {
		fmt.Printf("  [PrescribeMedication] Step 3 complete: compliance audit passed (risk=%.2f, %d events verified)\n",
			compliance.RiskScore, compliance.EventCount)
	}

	// Step 4: Dispense the medication.
	// In the happy path we attach PropagateOwnHistory() — the pharmacy
	// receives our events only (no ancestral chain) and can verify that the
	// allergy and interaction screens ran. In the negative scenario
	// (rec.ForwardLineage == false) we deliberately omit propagation, so the
	// pharmacy receives no lineage and refuses to dispense.
	dispenseOpts := []workflow.CallActivityOption{workflow.WithActivityInput(rec)}
	if rec.ForwardLineage {
		dispenseOpts = append(dispenseOpts,
			workflow.WithHistoryPropagation(workflow.PropagateOwnHistory()))
	}
	if !ctx.IsReplaying() {
		if rec.ForwardLineage {
			fmt.Println("  [PrescribeMedication] Step 4: CallActivity(DispenseMedication)")
			fmt.Println("                        -> WithHistoryPropagation(PropagateOwnHistory)")
		} else {
			fmt.Println("  [PrescribeMedication] Step 4: CallActivity(DispenseMedication)")
			fmt.Println("                        -> NO history propagation (negative scenario)")
		}
	}
	var dispense DispenseResult
	if err := ctx.CallActivity(DispenseMedication, dispenseOpts...).Await(&dispense); err != nil {
		return nil, fmt.Errorf("dispense failed: %w", err)
	}
	if dispense.Status != "dispensed" {
		if !ctx.IsReplaying() {
			fmt.Printf("  [PrescribeMedication] Step 4 BLOCKED: pharmacy refused to dispense (%s)\n",
				dispense.Reason)
		}
		return fmt.Sprintf("prescription not dispensed: pharmacy refused (%s)", dispense.Reason), nil
	}
	if !ctx.IsReplaying() {
		fmt.Printf("  [PrescribeMedication] Step 4 complete: dispensed (id=%s, %d events verified)\n",
			dispense.DispenseID, dispense.EventCount)
	}

	result := fmt.Sprintf("dispensed: id=%s, patient=%s, drug=%s %.0fmg",
		dispense.DispenseID, rec.PatientID, rec.Medication, rec.Dosage)
	if !ctx.IsReplaying() {
		fmt.Printf("  [PrescribeMedication] COMPLETE: %s\n", result)
	}
	return result, nil
}

// CheckAllergies looks up the patient's allergy list and clears or blocks
// the prescription.
func CheckAllergies(ctx workflow.ActivityContext) (any, error) {
	var rec PatientRecord
	if err := ctx.GetInput(&rec); err != nil {
		return false, err
	}

	ph := ctx.GetPropagatedHistory()
	fmt.Printf("  [CheckAllergies] Screening %s for %s (propagated history: %s)\n",
		rec.PatientID, rec.Medication, describeHistory(ph))
	return true, nil
}

// ScreenDrugInteractions checks the candidate prescription against the
// patient's active medication list.
func ScreenDrugInteractions(ctx workflow.ActivityContext) (any, error) {
	var rec PatientRecord
	if err := ctx.GetInput(&rec); err != nil {
		return false, err
	}

	ph := ctx.GetPropagatedHistory()
	fmt.Printf("  [ScreenDrugInteractions] Screening %s %.0fmg for %s (propagated history: %s)\n",
		rec.Medication, rec.Dosage, rec.PatientID, describeHistory(ph))
	return true, nil
}

// ComplianceAudit is a child wf that inspects the parent's propagated
// history to verify the prescribing pipeline ran correctly. It refuses
// to approve dispensing unless the required upstream steps
// (insurance, allergies, interactions) are all present and completed.
func ComplianceAudit(ctx *workflow.WorkflowContext) (any, error) {
	var rec PatientRecord
	if err := ctx.GetInput(&rec); err != nil {
		return nil, err
	}

	if !ctx.IsReplaying() {
		fmt.Printf("  [ComplianceAudit] Auditing prescription for patient %s\n", rec.PatientID)
	}

	history := ctx.GetPropagatedHistory()
	if history == nil {
		if !ctx.IsReplaying() {
			fmt.Println("  [ComplianceAudit] WARNING: No propagated history received!")
			fmt.Println("  [ComplianceAudit] BLOCKED — cannot verify upstream pipeline without history")
		}
		return ComplianceResult{
			Compliant: false,
			RiskScore: 1.0,
			Reason:    "no execution history provided — cannot verify caller pipeline",
		}, nil
	}

	if !ctx.IsReplaying() {
		fmt.Printf("  [ComplianceAudit] Received propagated history: %d events (scope: %s)\n",
			len(history.Events()), describeScope(history.Scope()))
		fmt.Printf("  [ComplianceAudit] Apps in chain: %v\n", history.GetAppIDs())
		for _, wf := range history.GetWorkflows() {
			fmt.Printf("  [ComplianceAudit]   workflow: app=%s, name=%s, instance=%s\n",
				wf.AppID, wf.Name, wf.InstanceID)
		}
	}

	intakeWf, err := history.GetLastWorkflowByName("PatientIntake")
	if err != nil {
		return ComplianceResult{}, fmt.Errorf("expected PatientIntake in propagated history: %w", err)
	}
	prescribeWf, err := history.GetLastWorkflowByName("PrescribeMedication")
	if err != nil {
		return ComplianceResult{}, fmt.Errorf("expected PrescribeMedication in propagated history: %w", err)
	}
	insurance, err := intakeWf.GetLastActivityByName("VerifyInsurance")
	if err != nil {
		return ComplianceResult{}, fmt.Errorf("expected VerifyInsurance in propagated history: %w", err)
	}
	allergies, err := prescribeWf.GetLastActivityByName("CheckAllergies")
	if err != nil {
		return ComplianceResult{}, fmt.Errorf("expected CheckAllergies in propagated history: %w", err)
	}
	interactions, err := prescribeWf.GetLastActivityByName("ScreenDrugInteractions")
	if err != nil {
		return ComplianceResult{}, fmt.Errorf("expected ScreenDrugInteractions in propagated history: %w", err)
	}

	if !ctx.IsReplaying() {
		fmt.Printf("  [ComplianceAudit] Verification:\n")
		fmt.Printf("  [ComplianceAudit]   PatientIntake/VerifyInsurance: started=%v, completed=%v\n",
			insurance.Started, insurance.Completed)
		fmt.Printf("  [ComplianceAudit]   PrescribeMedication/CheckAllergies: started=%v, completed=%v\n",
			allergies.Started, allergies.Completed)
		fmt.Printf("  [ComplianceAudit]   PrescribeMedication/ScreenDrugInteractions: started=%v, completed=%v\n",
			interactions.Started, interactions.Completed)
	}

	if !insurance.Completed || !allergies.Completed || !interactions.Completed {
		if !ctx.IsReplaying() {
			fmt.Println("  [ComplianceAudit] BLOCKED — required upstream checks not completed")
		}
		return ComplianceResult{
			Compliant:  false,
			RiskScore:  0.9,
			Reason:     "required upstream checks not completed in propagated history",
			EventCount: len(history.Events()),
		}, nil
	}

	riskScore := 0.1
	if rec.Dosage > 1000 {
		riskScore = 0.3
	}

	if !ctx.IsReplaying() {
		fmt.Printf("  [ComplianceAudit] APPROVED (risk=%.2f)\n", riskScore)
	}
	return ComplianceResult{
		Compliant:  true,
		RiskScore:  riskScore,
		Reason:     "all upstream checks verified in propagated history",
		EventCount: len(history.Events()),
	}, nil
}

// DispenseMedication issues the final prescription. The pharmacy refuses to
// dispense unless the propagated workflow history proves the prescribing
// pipeline ran the required allergy and drug-interaction screens. If no
// history is propagated (or it is missing those checks), it returns a
// "refused" result instead of dispensing.
func DispenseMedication(ctx workflow.ActivityContext) (any, error) {
	var rec PatientRecord
	if err := ctx.GetInput(&rec); err != nil {
		return nil, err
	}

	ph := ctx.GetPropagatedHistory()
	fmt.Printf("  [DispenseMedication] Dispense request: %s %.0fmg for %s (propagated history: %s)\n",
		rec.Medication, rec.Dosage, rec.PatientID, describeHistory(ph))

	// Pharmacy policy: no lineage, no dispense. Without propagated history the
	// pharmacy cannot prove the prescription was screened, so it refuses.
	if ph == nil {
		fmt.Printf("  [DispenseMedication] REFUSED — no propagated history; cannot verify screening for %s\n",
			rec.PatientID)
		return DispenseResult{
			Status: "refused",
			Reason: "missing lineage: no propagated history received from prescriber",
		}, nil
	}

	eventCount := len(ph.Events())
	fmt.Printf("  [DispenseMedication] Apps in chain: %v\n", ph.GetAppIDs())
	for _, wf := range ph.GetWorkflows() {
		fmt.Printf("  [DispenseMedication]   workflow: app=%s, name=%s, instance=%s\n",
			wf.AppID, wf.Name, wf.InstanceID)
	}
	scheduledNames := make(map[string]string) // key=taskExecutionId, val=activity name
	for i, event := range ph.Events() {
		if ts := event.GetTaskScheduled(); ts != nil {
			scheduledNames[ts.GetTaskExecutionId()] = ts.GetName()
		}
		fmt.Printf("  [DispenseMedication]   event[%d]: %s\n", i, describeEventResolved(event, scheduledNames))
	}

	// Verify the prescriber's own history shows both screens completed.
	prescribeWf, err := ph.GetLastWorkflowByName("PrescribeMedication")
	if err != nil {
		fmt.Printf("  [DispenseMedication] REFUSED — propagated history is missing the PrescribeMedication lineage for %s\n",
			rec.PatientID)
		return DispenseResult{
			Status:     "refused",
			Reason:     "missing lineage: PrescribeMedication not present in propagated history",
			EventCount: eventCount,
		}, nil
	}
	allergies, errAllergy := prescribeWf.GetLastActivityByName("CheckAllergies")
	interactions, errInteraction := prescribeWf.GetLastActivityByName("ScreenDrugInteractions")
	if errAllergy != nil || errInteraction != nil || !allergies.Completed || !interactions.Completed {
		fmt.Printf("  [DispenseMedication] REFUSED — required screening not verified in propagated history for %s\n",
			rec.PatientID)
		return DispenseResult{
			Status:     "refused",
			Reason:     "missing lineage: allergy/interaction screening not verified in propagated history",
			EventCount: eventCount,
		}, nil
	}

	dispenseID := fmt.Sprintf("rx-%s-%d", rec.PatientID, time.Now().UnixMilli())
	fmt.Printf("  [DispenseMedication] DISPENSED: %s\n", dispenseID)

	return DispenseResult{
		DispenseID: dispenseID,
		Status:     "dispensed",
		EventCount: eventCount,
	}, nil
}

// describeEventResolved returns a human-readable description of a history event.
func describeEventResolved(event *protos.HistoryEvent, scheduledNames map[string]string) string {
	eventType := fmt.Sprintf("%T", event.EventType)
	if idx := strings.LastIndex(eventType, "."); idx >= 0 {
		eventType = eventType[idx+1:]
	}
	switch {
	case event.GetTaskScheduled() != nil:
		return fmt.Sprintf("%s -> %s", eventType, event.GetTaskScheduled().GetName())
	case event.GetTaskCompleted() != nil:
		if name, ok := scheduledNames[event.GetTaskCompleted().GetTaskExecutionId()]; ok {
			return fmt.Sprintf("%s -> %s", eventType, name)
		}
		return eventType
	case event.GetExecutionStarted() != nil:
		return fmt.Sprintf("%s -> %s", eventType, event.GetExecutionStarted().GetName())
	case event.GetChildWorkflowInstanceCreated() != nil:
		return fmt.Sprintf("%s -> %s", eventType, event.GetChildWorkflowInstanceCreated().GetName())
	default:
		return eventType
	}
}

func describeHistory(ph *workflow.PropagatedHistory) string {
	if ph == nil {
		return "none"
	}
	return fmt.Sprintf("%d events, scope=%s", len(ph.Events()), describeScope(ph.Scope()))
}

func describeScope(scope fmt.Stringer) string {
	s := scope.String()
	s = strings.TrimPrefix(s, "HISTORY_PROPAGATION_SCOPE_")
	return s
}
