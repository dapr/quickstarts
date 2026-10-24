//go:build !named_version && !patching

package main

import "github.com/dapr/durabletask-go/workflow"

// registerWorkflows registers the original workflow. It is the only version,
// so it is the latest one.
func registerWorkflows(r *workflow.Registry) error {
	return r.AddVersionedWorkflow("NotifyUser", true, NotifyUser)
}

// NotifyUser notifies a user with an email.
func NotifyUser(ctx *workflow.WorkflowContext) (any, error) {
	var input string
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	var result string
	if err := ctx.CallActivity(SendEmail, workflow.WithActivityInput(input)).Await(&result); err != nil {
		return nil, err
	}
	return result, nil
}
