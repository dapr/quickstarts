package main

import (
	"fmt"

	"github.com/dapr/durabletask-go/workflow"
)

// SendEmail is the activity of the original workflow.
func SendEmail(ctx workflow.ActivityContext) (any, error) {
	var input string
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("send_email: Received input: %s.\n", input)
	return "Sent email to " + input, nil
}

// SendSMS is the activity that the new versions of the workflow call.
func SendSMS(ctx workflow.ActivityContext) (any, error) {
	var input string
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("send_sms: Received input: %s.\n", input)
	return "Sent SMS to " + input, nil
}
