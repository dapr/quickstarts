//go:build named_version

package main

import "github.com/dapr/durabletask-go/workflow"

// registerWorkflows registers two versions of the workflow "NotifyUser".
// The version name is the name of the Go function. The boolean marks the
// latest version: new instances start with it. Instances that already run
// keep the version that they started with.
func registerWorkflows(r *workflow.Registry) error {
	if err := r.AddVersionedWorkflow("NotifyUser", false, NotifyUser); err != nil {
		return err
	}
	return r.AddVersionedWorkflow("NotifyUser", true, NotifyUserNew)
}

// NotifyUser is the original version. It notifies a user with an email.
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

// NotifyUserNew is the latest version. It notifies a user with an SMS.
func NotifyUserNew(ctx *workflow.WorkflowContext) (any, error) {
	var input string
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	var result string
	if err := ctx.CallActivity(SendSMS, workflow.WithActivityInput(input)).Await(&result); err != nil {
		return nil, err
	}
	return result, nil
}
