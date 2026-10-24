package main

import (
	"fmt"
	"math/rand/v2"
	"time"

	"github.com/dapr/durabletask-go/workflow"
)

// checkInterval is how long the workflow waits before it checks again.
const checkInterval = 2 * time.Second

// Status is the result of the CheckStatus activity.
type Status struct {
	IsReady bool `json:"is_ready"`
}

// MonitorWorkflow checks the status of a fictional resource. When the
// resource is not ready, the workflow waits with a durable timer and then
// continues as a new instance with a higher counter.
// Workflow code must be deterministic. Write any non-deterministic behavior
// inside activities.
func MonitorWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var counter int
	if err := ctx.GetInput(&counter); err != nil {
		return nil, err
	}

	var status Status
	if err := ctx.CallActivity(CheckStatus, workflow.WithActivityInput(counter)).Await(&status); err != nil {
		return nil, err
	}

	if !status.IsReady {
		if err := ctx.CreateTimer(checkInterval).Await(nil); err != nil {
			return nil, err
		}
		// ContinueAsNew restarts the workflow with a new input and a clean
		// history. The current run ends after this call.
		ctx.ContinueAsNew(counter + 1)
		return nil, nil
	}

	return fmt.Sprintf("Status is healthy after %d times.", counter), nil
}

// CheckStatus simulates a status check. A random number decides whether the
// resource is ready. The chance of a ready resource grows with the input.
func CheckStatus(ctx workflow.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("check_status: Received input: %d.\n", input)
	isReady := rand.IntN(input+1) > 1
	return Status{IsReady: isReady}, nil
}
