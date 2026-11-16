package challengestips

import (
	"time"

	"github.com/dapr/durabletask-go/workflow"
	"github.com/google/uuid"
)

// NonDeterministicWorkflow shows what not to do.
//
// Do not use non-deterministic operations in a workflow!
// These operations will create a new value every time the
// workflow is replayed.
func NonDeterministicWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	orderID := uuid.NewString()
	orderDate := time.Now()
	if err := ctx.CallActivity(SubmitID, workflow.WithActivityInput(orderID)).Await(nil); err != nil {
		return nil, err
	}
	if err := ctx.CallActivity(SubmitDate, workflow.WithActivityInput(orderDate)).Await(nil); err != nil {
		return nil, err
	}

	return orderID, nil
}

// DeterministicWorkflow shows the fix.
//
// Either wrap non-deterministic operations in an activity. Or use deterministic
// alternatives on the WorkflowContext instead. These operations create the
// same value when the workflow is replayed.
func DeterministicWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var input string
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}

	var orderID string
	if err := ctx.CallActivity(CreateOrderID, workflow.WithActivityInput(input)).Await(&orderID); err != nil {
		return nil, err
	}
	orderDate := ctx.CurrentTimeUTC()
	if err := ctx.CallActivity(SubmitID, workflow.WithActivityInput(orderID)).Await(nil); err != nil {
		return nil, err
	}
	if err := ctx.CallActivity(SubmitDate, workflow.WithActivityInput(orderDate)).Await(nil); err != nil {
		return nil, err
	}

	return orderID, nil
}
