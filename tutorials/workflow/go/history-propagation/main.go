// This quickstart demonstrates workflow history propagation in a
// patient intake / e-prescribing scenario. A root PatientIntake workflow
// orders a prescription via a child PrescribeMedication workflow, which
// in turn runs a ComplianceAudit child workflow and a DispenseMedication
// activity. The compliance audit and dispensing steps inspect the
// propagated execution history of their callers to verify that the
// required upstream checks (insurance, allergies, drug interactions)
// actually ran before they make a decision.
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/dapr/durabletask-go/workflow"
	"github.com/dapr/go-sdk/client"
)

var logger = log.New(os.Stdout, "", log.LstdFlags)

func main() {
	r := workflow.NewRegistry()

	// Step 1: PatientIntake (root workflow)
	//   Step 1.1: VerifyInsurance (activity, no propagation)
	//   Step 1.2: PrescribeMedication (child wf, propagate lineage)
	//     Step 1.2.1: CheckAllergies (activity, no propagation)
	//     Step 1.2.2: ScreenDrugInteractions (activity, no propagation)
	//     Step 1.2.3: ComplianceAudit (grandchild wf, propagate lineage)
	//     Step 1.2.4: DispenseMedication (activity, propagate own history)
	for _, add := range []func() error{
		func() error { return r.AddWorkflow(PatientIntake) },
		func() error { return r.AddActivity(VerifyInsurance) },
		func() error { return r.AddWorkflow(PrescribeMedication) },
		func() error { return r.AddActivity(CheckAllergies) },
		func() error { return r.AddActivity(ScreenDrugInteractions) },
		func() error { return r.AddWorkflow(ComplianceAudit) },
		func() error { return r.AddActivity(DispenseMedication) },
	} {
		if err := add(); err != nil {
			logger.Fatal(err)
		}
	}

	wfClient, err := client.NewWorkflowClient()
	if err != nil {
		logger.Fatal(err)
	}

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	if err = wfClient.StartWorker(ctx, r); err != nil {
		logger.Fatal(err)
	}

	fmt.Println(banner("WORKFLOW HISTORY PROPAGATION DEMO — PATIENT INTAKE"))
	fmt.Println()
	fmt.Println("  Flow: PatientIntake -> VerifyInsurance")
	fmt.Println("           -> PrescribeMedication (child wf, lineage)")
	fmt.Println("               -> CheckAllergies -> ScreenDrugInteractions")
	fmt.Println("               -> ComplianceAudit (child wf, lineage)     <-- sees PatientIntake + PrescribeMedication events")
	fmt.Println("               -> DispenseMedication (activity, own only) <-- sees only PrescribeMedication events")

	// Scenario 1 (happy path): PrescribeMedication forwards its own history to
	// the pharmacy, which verifies the upstream screening and dispenses.
	runScenario(ctx, wfClient, "SCENARIO 1: lineage forwarded — pharmacy dispenses",
		"intake-ok", PatientRecord{
			PatientID:      "P-1042",
			Name:           "Jane Doe",
			DOB:            "1985-06-12",
			MRN:            "MRN-77231",
			Condition:      "bacterial sinusitis",
			Medication:     "amoxicillin",
			Dosage:         500,
			ForwardLineage: true,
		})

	// Scenario 2 (negative): PrescribeMedication dispenses WITHOUT propagating
	// its history, so the pharmacy receives no lineage and refuses to dispense.
	runScenario(ctx, wfClient, "SCENARIO 2: lineage withheld — pharmacy refuses",
		"intake-missing-lineage", PatientRecord{
			PatientID:      "P-2087",
			Name:           "John Roe",
			DOB:            "1979-03-04",
			MRN:            "MRN-55810",
			Condition:      "strep throat",
			Medication:     "penicillin",
			Dosage:         500,
			ForwardLineage: false,
		})

	fmt.Println()
	fmt.Println(banner("COMPLETE"))

	// Both workflows have completed and their state was purged, so return.
	// The deferred cancel() stops the worker and lets `dapr run` exit on its
	// own — no Ctrl+C needed.
}

// runScenario schedules one PatientIntake run, waits for it to finish, prints
// the final result, and purges its state so the demo can exit cleanly.
func runScenario(ctx context.Context, wfClient *workflow.Client, title, instanceID string, rec PatientRecord) {
	fmt.Println()
	fmt.Println(banner(title))

	id, err := wfClient.ScheduleWorkflow(ctx, "PatientIntake",
		workflow.WithInstanceID(instanceID),
		workflow.WithInput(rec),
	)
	if err != nil {
		logger.Fatalf("failed to start workflow: %v", err)
	}
	fmt.Printf("  [main] Started workflow: %s\n", id)

	waitCtx, waitCancel := context.WithTimeout(ctx, 30*time.Second)
	defer waitCancel()
	meta, err := wfClient.WaitForWorkflowCompletion(waitCtx, id)
	if err != nil {
		logger.Fatalf("workflow failed: %v", err)
	}
	if meta != nil {
		fmt.Printf("  [main] Result: %s\n", meta.Output.GetValue())
	}

	if err = wfClient.PurgeWorkflowState(ctx, id); err != nil {
		logger.Printf("failed to purge: %v", err)
	}
}

func banner(msg string) string {
	line := strings.Repeat("=", len(msg)+4)
	return fmt.Sprintf("%s\n= %s =\n%s", line, msg, line)
}
