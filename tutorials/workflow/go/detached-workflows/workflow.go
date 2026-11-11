package main

import (
	"fmt"
	"time"

	"github.com/dapr/durabletask-go/workflow"
)

// ProcessOrderWorkflow is the caller. It processes the customer's order and
// then *detaches* an audit workflow with ScheduleNewWorkflow — a fire-and-forget
// call that returns the new instance ID synchronously. The order workflow does
// NOT await the audit: it returns its confirmation immediately while the audit
// keeps running on its own.
func ProcessOrderWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var order Order
	if err := ctx.GetInput(&order); err != nil {
		return nil, err
	}

	if !ctx.IsReplaying() {
		fmt.Printf("[ProcessOrder] Processing order %s (%s, $%d)\n", order.ID, order.Item, order.Amount)
	}

	// Charge the customer (a normal, awaited activity).
	if err := ctx.CallActivity(ProcessPayment,
		workflow.WithActivityInput(order),
	).Await(nil); err != nil {
		return nil, fmt.Errorf("payment failed: %w", err)
	}

	// Detach the audit. ScheduleNewWorkflow returns the new instance ID right
	// away — there is no task to await. The audit becomes an independent,
	// top-level workflow with no parent linkage: it survives this workflow
	// completing, failing, or being terminated.
	//
	// WithDetachedWorkflowInstanceID gives it a readable ID we can track later.
	// Omit it and the runtime generates a deterministic "<callerID>-<n>" ID.
	auditID, err := ctx.ScheduleNewWorkflow(AuditWorkflow,
		workflow.WithDetachedWorkflowInput(AuditRecord{OrderID: order.ID, Amount: order.Amount}),
		workflow.WithDetachedWorkflowInstanceID("audit-"+order.ID),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to detach audit workflow: %w", err)
	}

	if !ctx.IsReplaying() {
		fmt.Printf("[ProcessOrder] Detached audit workflow %s — fire and forget, not awaiting it\n", auditID)
		fmt.Printf("[ProcessOrder] Order %s confirmed; returning now while the audit runs on its own\n", order.ID)
	}

	// Return immediately. The audit is still running.
	return OrderResult{Status: "confirmed", AuditWorkflowID: auditID}, nil
}

// AuditWorkflow is the detached workflow. It runs independently of the order
// that started it. The timer simulates audit/compliance work that takes longer
// than the order itself, so you can observe it still running after the order has
// already completed.
func AuditWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var rec AuditRecord
	if err := ctx.GetInput(&rec); err != nil {
		return nil, err
	}

	if !ctx.IsReplaying() {
		fmt.Printf("[Audit] Starting independent audit for order %s\n", rec.OrderID)
	}

	if err := ctx.CallActivity(RecordAudit,
		workflow.WithActivityInput(rec),
	).Await(nil); err != nil {
		return nil, fmt.Errorf("failed to record audit: %w", err)
	}

	// Simulate longer-running, independent work.
	if err := ctx.CreateTimer(5 * time.Second).Await(nil); err != nil {
		return nil, err
	}

	if err := ctx.CallActivity(ArchiveAudit,
		workflow.WithActivityInput(rec),
	).Await(nil); err != nil {
		return nil, fmt.Errorf("failed to archive audit: %w", err)
	}

	if !ctx.IsReplaying() {
		fmt.Printf("[Audit] Audit for order %s complete\n", rec.OrderID)
	}
	return AuditResult{OrderID: rec.OrderID, Archived: true}, nil
}

// ProcessPayment charges the customer for the order.
func ProcessPayment(ctx workflow.ActivityContext) (any, error) {
	var order Order
	if err := ctx.GetInput(&order); err != nil {
		return nil, err
	}
	fmt.Printf("[ProcessPayment] Charged $%d for order %s\n", order.Amount, order.ID)
	return nil, nil
}

// RecordAudit writes the initial audit entry.
func RecordAudit(ctx workflow.ActivityContext) (any, error) {
	var rec AuditRecord
	if err := ctx.GetInput(&rec); err != nil {
		return nil, err
	}
	fmt.Printf("[RecordAudit] Recording audit entry for order %s ($%d)\n", rec.OrderID, rec.Amount)
	return nil, nil
}

// ArchiveAudit finalizes and archives the audit entry.
func ArchiveAudit(ctx workflow.ActivityContext) (any, error) {
	var rec AuditRecord
	if err := ctx.GetInput(&rec); err != nil {
		return nil, err
	}
	fmt.Printf("[ArchiveAudit] Archived audit for order %s\n", rec.OrderID)
	return nil, nil
}
