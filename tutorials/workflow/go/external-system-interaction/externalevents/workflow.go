package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/dapr/durabletask-go/workflow"
)

// approvalTimeout is how long the workflow waits for the approval event.
const approvalTimeout = 2 * time.Minute

// Order is the input of the workflow.
type Order struct {
	ID          string  `json:"id"`
	Description string  `json:"description"`
	Quantity    int     `json:"quantity"`
	TotalPrice  float64 `json:"total_price"`
}

// ApprovalStatus is the payload of the approval-event.
type ApprovalStatus struct {
	OrderID    string `json:"order_id"`
	IsApproved bool   `json:"is_approved"`
}

// ExternalEventsWorkflow requests an external approval if the order has a
// total price greater than 250 dollars. The workflow waits for the
// approval-event, but not for longer than two minutes.
// Workflow code must be deterministic. Write any non-deterministic behavior
// inside activities.
func ExternalEventsWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var order Order
	if err := ctx.GetInput(&order); err != nil {
		return nil, err
	}

	approval := ApprovalStatus{OrderID: order.ID, IsApproved: true}

	if order.TotalPrice > 250 {
		if err := ctx.CallActivity(RequestApproval, workflow.WithActivityInput(order)).Await(nil); err != nil {
			return nil, err
		}

		// Wait for the event, with a timeout. When the timeout expires first,
		// Await returns workflow.ErrTaskCanceled.
		var payload json.RawMessage
		err := ctx.WaitForExternalEvent("approval-event", approvalTimeout).Await(&payload)
		if errors.Is(err, workflow.ErrTaskCanceled) {
			message := fmt.Sprintf("Approval request for order %s timed out.", order.ID)
			if err := ctx.CallActivity(SendNotification, workflow.WithActivityInput(message)).Await(nil); err != nil {
				return nil, err
			}
			return message, nil
		}
		if err != nil {
			return nil, err
		}

		approval, err = parseApproval(payload)
		if err != nil {
			return nil, err
		}
	}

	if approval.IsApproved {
		if err := ctx.CallActivity(ProcessOrder, workflow.WithActivityInput(order)).Await(nil); err != nil {
			return nil, err
		}
	}

	message := fmt.Sprintf("Order %s has been rejected.", order.ID)
	if approval.IsApproved {
		message = fmt.Sprintf("Order %s has been approved.", order.ID)
	}
	if err := ctx.CallActivity(SendNotification, workflow.WithActivityInput(message)).Await(nil); err != nil {
		return nil, err
	}

	return message, nil
}

// parseApproval reads the payload of the approval-event. The payload is a
// JSON object when it comes from the Dapr HTTP API. The Dapr CLI can send the
// same object as a JSON string, so this function accepts both forms.
func parseApproval(payload json.RawMessage) (ApprovalStatus, error) {
	var approval ApprovalStatus
	var text string
	if err := json.Unmarshal(payload, &text); err == nil {
		payload = json.RawMessage(text)
	}
	if err := json.Unmarshal(payload, &approval); err != nil {
		return ApprovalStatus{}, fmt.Errorf("invalid approval-event payload: %w", err)
	}
	return approval, nil
}

// RequestApproval sends the approval request to another system.
func RequestApproval(ctx workflow.ActivityContext) (any, error) {
	var order Order
	if err := ctx.GetInput(&order); err != nil {
		return nil, err
	}
	fmt.Printf("request_approval: Request approval for order: %s.\n", order.ID)
	// Imagine an approval request being sent to another system
	return nil, nil
}

// SendNotification sends a notification to the user.
func SendNotification(ctx workflow.ActivityContext) (any, error) {
	var message string
	if err := ctx.GetInput(&message); err != nil {
		return nil, err
	}
	fmt.Printf("send_notification: %s\n", message)
	// Imagine a notification being sent to the user
	return nil, nil
}

// ProcessOrder processes the order in another system.
func ProcessOrder(ctx workflow.ActivityContext) (any, error) {
	var order Order
	if err := ctx.GetInput(&order); err != nil {
		return nil, err
	}
	fmt.Printf("process_order: Processed order: %s.\n", order.ID)
	// Imagine the order being processed by another system
	return nil, nil
}
