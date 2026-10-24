package main

import (
	"fmt"
	"time"

	"github.com/dapr/durabletask-go/workflow"
)

// NeverEndingWorkflow sends a notification, waits two seconds, and then
// restarts itself with a higher counter. It never completes on its own, so
// you can manage it with the workflow client.
// Workflow code must be deterministic. Write any non-deterministic behavior
// inside activities.
func NeverEndingWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var counter int
	if err := ctx.GetInput(&counter); err != nil {
		return nil, err
	}

	if err := ctx.CallActivity(SendNotification, workflow.WithActivityInput(counter)).Await(nil); err != nil {
		return nil, err
	}

	if err := ctx.CreateTimer(2 * time.Second).Await(nil); err != nil {
		return nil, err
	}

	// ContinueAsNew restarts the workflow with a new input and a clean history.
	ctx.ContinueAsNew(counter + 1)
	return nil, nil
}

// SendNotification prints the counter. A real app sends a message to a user here.
func SendNotification(ctx workflow.ActivityContext) (any, error) {
	var counter int
	if err := ctx.GetInput(&counter); err != nil {
		return nil, err
	}
	fmt.Printf("send_notification: Received input: %d.\n", counter)
	return nil, nil
}
