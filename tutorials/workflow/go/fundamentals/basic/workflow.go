package main

import (
	"fmt"

	"github.com/dapr/durabletask-go/workflow"
)

// BasicWorkflow orchestrates activities and other (child) workflows, and
// includes business logic (if/else or switch statements).
// Workflow code must be deterministic. Write any non-deterministic behavior
// inside activities.
//
// The first argument (ctx) is the *workflow.WorkflowContext. It contains
// properties about the workflow instance, and methods to call activities.
// The input of the workflow is not a function argument. Read it with
// ctx.GetInput. It can be a simple or a complex type.
func BasicWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var input string
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}

	var result1 string
	if err := ctx.CallActivity(Activity1, workflow.WithActivityInput(input)).Await(&result1); err != nil {
		return nil, err
	}

	var result2 string
	if err := ctx.CallActivity(Activity2, workflow.WithActivityInput(result1)).Await(&result2); err != nil {
		return nil, err
	}

	return result2, nil
}

// Activity code typically performs one specific task, like calling an API to
// store or retrieve data. You can use other Dapr APIs inside an activity.
//
// The argument (ctx) is the workflow.ActivityContext. It gives access to the
// input of the activity with ctx.GetInput. There is only one input value.
// Use a struct if the activity needs more than one value.

// Activity1 appends " Two" to its input.
func Activity1(ctx workflow.ActivityContext) (any, error) {
	var input string
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("activity1: Received input: %s.\n", input)
	return input + " Two", nil
}

// Activity2 appends " Three" to its input.
func Activity2(ctx workflow.ActivityContext) (any, error) {
	var input string
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("activity2: Received input: %s.\n", input)
	return input + " Three", nil
}
