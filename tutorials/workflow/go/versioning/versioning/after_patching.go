//go:build patching

package main

import "github.com/dapr/durabletask-go/workflow"

// registerWorkflows registers the workflow. It is the only version, so it is
// the latest one. The patch is inside the workflow code.
func registerWorkflows(r *workflow.Registry) error {
	return r.AddVersionedWorkflow("NotifyUser", true, NotifyUser)
}

// NotifyUser notifies a user. IsPatched("send_sms") is true for new instances
// and for instances that reach the check after the patch is deployed. It is
// false for instances that already ran past this point with the old code.
// Those instances replay the original code path.
func NotifyUser(ctx *workflow.WorkflowContext) (any, error) {
	var input string
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	var result string
	if ctx.IsPatched("send_sms") {
		if err := ctx.CallActivity(SendSMS, workflow.WithActivityInput(input)).Await(&result); err != nil {
			return nil, err
		}
	} else {
		if err := ctx.CallActivity(SendEmail, workflow.WithActivityInput(input)).Await(&result); err != nil {
			return nil, err
		}
	}
	return result, nil
}
