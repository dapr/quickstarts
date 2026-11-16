package main

import (
	"fmt"

	"github.com/dapr/durabletask-go/workflow"
)

// ChainingWorkflow calls three activities in sequence. The output of each
// activity is the input of the next one.
// Workflow code must be deterministic. Write any non-deterministic behavior
// inside activities.
func ChainingWorkflow(ctx *workflow.WorkflowContext) (any, error) {
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

	var result3 string
	if err := ctx.CallActivity(Activity3, workflow.WithActivityInput(result2)).Await(&result3); err != nil {
		return nil, err
	}

	return result3, nil
}

// Activity1 appends " is" to its input.
func Activity1(ctx workflow.ActivityContext) (any, error) {
	var input string
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("activity1: Received input: %s.\n", input)
	return input + " is", nil
}

// Activity2 appends " task" to its input.
func Activity2(ctx workflow.ActivityContext) (any, error) {
	var input string
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("activity2: Received input: %s.\n", input)
	return input + " task", nil
}

// Activity3 appends " chaining" to its input.
func Activity3(ctx workflow.ActivityContext) (any, error) {
	var input string
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("activity3: Received input: %s.\n", input)
	return input + " chaining", nil
}
