// This example demonstrates Dapr detached workflows. A ProcessOrderWorkflow
// confirms an order and then detaches an AuditWorkflow with ScheduleNewWorkflow:
// a fire-and-forget call that returns the new instance ID synchronously and does
// not link the audit's lifecycle to the caller. The order completes quickly while
// the detached audit keeps running independently as a top-level workflow.
package main

import (
	"context"
	"encoding/json"
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

func main() {
	r := workflow.NewRegistry()
	for _, add := range []func() error{
		func() error { return r.AddWorkflow(ProcessOrderWorkflow) },
		func() error { return r.AddWorkflow(AuditWorkflow) },
		func() error { return r.AddActivity(ProcessPayment) },
		func() error { return r.AddActivity(RecordAudit) },
		func() error { return r.AddActivity(ArchiveAudit) },
	} {
		if err := add(); err != nil {
			log.Fatal(err)
		}
	}

	wfClient, err := client.NewWorkflowClient()
	if err != nil {
		log.Fatal(err)
	}

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	if err = wfClient.StartWorker(ctx, r); err != nil {
		log.Fatal(err)
	}

	fmt.Println(banner("DETACHED WORKFLOWS DEMO — fire-and-forget order audit"))

	// 1. Start the order workflow and wait for it to finish.
	order := Order{ID: "order-1001", Item: "wireless headphones", Amount: 150}
	fmt.Printf("\n[main] Scheduling ProcessOrderWorkflow (%s)\n", order.ID)
	orderID, err := wfClient.ScheduleWorkflow(ctx, "ProcessOrderWorkflow",
		workflow.WithInstanceID(order.ID),
		workflow.WithInput(order),
	)
	if err != nil {
		log.Fatalf("failed to start order workflow: %v", err)
	}

	orderWaitCtx, orderCancel := context.WithTimeout(ctx, 30*time.Second)
	defer orderCancel()
	orderMeta, err := wfClient.WaitForWorkflowCompletion(orderWaitCtx, orderID,
		workflow.WithFetchPayloads(true))
	if err != nil {
		log.Fatalf("order workflow failed: %v", err)
	}

	var result OrderResult
	if err := json.Unmarshal([]byte(orderMeta.Output.GetValue()), &result); err != nil {
		log.Fatalf("failed to read order result: %v", err)
	}
	fmt.Printf("\n[main] ProcessOrderWorkflow COMPLETED: %s\n", result.Status)
	fmt.Printf("[main] The order is done, but it detached an audit that runs independently: %s\n",
		result.AuditWorkflowID)

	// 2. The order is finished. Show the detached audit is still running on its
	//    own — proof their lifecycles are independent. WaitForWorkflowStart
	//    returns once the audit has started; it is then in its timer, so RUNNING.
	startWaitCtx, startCancel := context.WithTimeout(ctx, 30*time.Second)
	defer startCancel()
	auditMeta, err := wfClient.WaitForWorkflowStart(startWaitCtx, result.AuditWorkflowID)
	if err != nil {
		log.Fatalf("failed to fetch detached audit: %v", err)
	}
	fmt.Printf("[main] %s status right now: %s  <-- caller already finished, detached workflow is still going\n",
		result.AuditWorkflowID, auditMeta.String())

	// 3. Wait for the detached audit to complete on its own.
	fmt.Printf("[main] Waiting for the detached audit to finish independently...\n")
	auditWaitCtx, auditCancel := context.WithTimeout(ctx, 30*time.Second)
	defer auditCancel()
	if _, err := wfClient.WaitForWorkflowCompletion(auditWaitCtx, result.AuditWorkflowID); err != nil {
		log.Fatalf("detached audit failed: %v", err)
	}
	fmt.Printf("[main] Detached audit COMPLETED independently: %s\n", result.AuditWorkflowID)

	// Clean up both instances so `dapr run -f .` can exit on its own.
	for _, id := range []string{orderID, result.AuditWorkflowID} {
		if err := wfClient.PurgeWorkflowState(ctx, id); err != nil {
			log.Printf("failed to purge %s: %v", id, err)
		}
	}

	fmt.Println(banner("DONE"))
}

func banner(msg string) string {
	line := strings.Repeat("=", len(msg)+4)
	return fmt.Sprintf("%s\n= %s =\n%s", line, msg, line)
}
