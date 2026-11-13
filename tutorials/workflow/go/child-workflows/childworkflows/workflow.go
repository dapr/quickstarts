package main

import (
	"fmt"

	"github.com/dapr/durabletask-go/workflow"
)

// ParentWorkflow starts one child workflow for each item of its input. It
// waits until all the child workflows complete and returns their results.
// Workflow code must be deterministic. Write any non-deterministic behavior
// inside activities.
func ParentWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var items []string
	if err := ctx.GetInput(&items); err != nil {
		return nil, err
	}

	// Schedule all the child workflows first, so they run at the same time.
	tasks := make([]workflow.Task, 0, len(items))
	for _, item := range items {
		tasks = append(tasks, ctx.CallChildWorkflow(ChildWorkflow, workflow.WithChildWorkflowInput(item)))
	}

	// Then wait for each of them to complete.
	results := make([]string, 0, len(items))
	for _, task := range tasks {
		var result string
		if err := task.Await(&result); err != nil {
			return nil, err
		}
		results = append(results, result)
	}

	return results, nil
}

// ChildWorkflow calls two activities in sequence. The output of the first
// activity is the input of the second one.
func ChildWorkflow(ctx *workflow.WorkflowContext) (any, error) {
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

// Activity1 appends " is processed" to its input.
func Activity1(ctx workflow.ActivityContext) (any, error) {
	var input string
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("activity1: Received input: %s.\n", input)
	return input + " is processed", nil
}

// Activity2 appends " as a child workflow." to its input.
func Activity2(ctx workflow.ActivityContext) (any, error) {
	var input string
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("activity2: Received input: %s.\n", input)
	return input + " as a child workflow.", nil
}
