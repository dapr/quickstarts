package challengestips

import "github.com/dapr/durabletask-go/workflow"

// LargePayloadSizeWorkflow shows what not to do.
//
// Do not pass large payloads between activities.
// They are stored in the Dapr state store twice, once as output argument
// for GetDocument, and once as input argument for UpdateDocument.
func LargePayloadSizeWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var docID string
	if err := ctx.GetInput(&docID); err != nil {
		return nil, err
	}

	var document Document
	if err := ctx.CallActivity(GetDocument, workflow.WithActivityInput(docID)).Await(&document); err != nil {
		return nil, err
	}
	var updatedDocument Document
	if err := ctx.CallActivity(UpdateDocument, workflow.WithActivityInput(document)).Await(&updatedDocument); err != nil {
		return nil, err
	}

	// More activities to process the updated document

	return updatedDocument, nil
}

// SmallPayloadSizeWorkflow shows the fix.
//
// Do pass small payloads between activities, preferably IDs only, or objects
// that are quick to (de)serialize in large volumes.
// Combine multiple actions, such as document retrieval and update, into a
// single activity, or use the Dapr State Store API to store more data.
func SmallPayloadSizeWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var docID string
	if err := ctx.GetInput(&docID); err != nil {
		return nil, err
	}

	var updatedDocID string
	if err := ctx.CallActivity(GetAndUpdateDocument, workflow.WithActivityInput(docID)).Await(&updatedDocID); err != nil {
		return nil, err
	}

	// More activities to process the updated document

	return updatedDocID, nil
}
