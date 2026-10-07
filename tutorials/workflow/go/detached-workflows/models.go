package main

// Order is the input to ProcessOrderWorkflow.
type Order struct {
	ID     string `json:"id"`
	Item   string `json:"item"`
	Amount int    `json:"amount"`
}

// OrderResult is what ProcessOrderWorkflow returns to its caller. It confirms
// the order and hands back the instance ID of the detached audit workflow that
// ScheduleNewWorkflow returned synchronously, so the rest of the app can track
// the audit independently.
type OrderResult struct {
	Status          string `json:"status"`
	AuditWorkflowID string `json:"auditWorkflowId"`
}

// AuditRecord is the input to the detached AuditWorkflow.
type AuditRecord struct {
	OrderID string `json:"orderId"`
	Amount  int    `json:"amount"`
}

// AuditResult is what the detached AuditWorkflow returns. Nothing flows back to
// the caller that detached it — this is observed only by code that looks up the
// audit instance by its own ID.
type AuditResult struct {
	OrderID  string `json:"orderId"`
	Archived bool   `json:"archived"`
}
