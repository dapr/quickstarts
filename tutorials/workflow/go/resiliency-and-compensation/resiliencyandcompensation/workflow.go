package main

import (
	"errors"
	"fmt"
	"time"

	"github.com/dapr/durabletask-go/workflow"
)

// ResiliencyAndCompensationWorkflow calls the MinusOne activity, then the
// Division activity with a retry policy. When Division fails after all
// retries, the workflow runs the PlusOne activity to compensate for MinusOne.
// Workflow code must be deterministic. Write any non-deterministic behavior
// inside activities.
func ResiliencyAndCompensationWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}

	// The retry policy applies to the activities that use it: three attempts
	// in total, with 2 seconds before the first retry.
	defaultRetryPolicy := &workflow.RetryPolicy{
		MaxAttempts:          3,
		InitialRetryInterval: 2 * time.Second,
	}

	var result1 int
	if err := ctx.CallActivity(MinusOne, workflow.WithActivityInput(input),
		workflow.WithActivityRetryPolicy(defaultRetryPolicy)).Await(&result1); err != nil {
		return nil, err
	}

	var result int
	err := ctx.CallActivity(Division, workflow.WithActivityInput(result1),
		workflow.WithActivityRetryPolicy(defaultRetryPolicy)).Await(&result)
	if err != nil {
		// Something went wrong in the Division activity which is not
		// recoverable. Perform a compensation action for the MinusOne
		// activity to revert any changes made in that activity.
		if err := ctx.CallActivity(PlusOne, workflow.WithActivityInput(result1)).Await(&result); err != nil {
			return nil, err
		}

		// A custom status message can be set on the workflow instance.
		// This can be used to clarify anything that happened during the
		// workflow execution.
		ctx.SetCustomStatus("Compensated minus_one activity with plus_one activity.")
	}

	return result, nil
}

// MinusOne subtracts 1 from its input.
func MinusOne(ctx workflow.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("minus_one: Received input: %d.\n", input)
	return input - 1, nil
}

// Division divides 100 by its input. When the divisor is 0 it returns an
// error. The workflow handles this error.
func Division(ctx workflow.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("division: Received input: %d.\n", input)
	if input == 0 {
		return nil, errors.New("division by zero")
	}
	return 100 / input, nil
}

// PlusOne adds 1 to its input.
func PlusOne(ctx workflow.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("plus_one: Received input: %d.\n", input)
	return input + 1, nil
}
