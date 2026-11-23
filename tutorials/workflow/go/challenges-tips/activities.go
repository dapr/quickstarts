package challengestips

import "github.com/dapr/durabletask-go/workflow"

// The activities below are placeholders that the snippets call. They have no
// real logic, so that each snippet compiles.

// Document is a payload that can be large.
type Document struct {
	ID      string `json:"id"`
	Content string `json:"content"`
}

func CreateOrderID(ctx workflow.ActivityContext) (any, error) {
	var input string
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	return input, nil
}

func SubmitID(ctx workflow.ActivityContext) (any, error) {
	var orderID string
	return nil, ctx.GetInput(&orderID)
}

func SubmitDate(ctx workflow.ActivityContext) (any, error) {
	var orderDate string
	return nil, ctx.GetInput(&orderDate)
}

func GetDocument(ctx workflow.ActivityContext) (any, error) {
	var docID string
	if err := ctx.GetInput(&docID); err != nil {
		return nil, err
	}
	return Document{ID: docID}, nil
}

func UpdateDocument(ctx workflow.ActivityContext) (any, error) {
	var doc Document
	if err := ctx.GetInput(&doc); err != nil {
		return nil, err
	}
	return doc, nil
}

func GetAndUpdateDocument(ctx workflow.ActivityContext) (any, error) {
	var docID string
	if err := ctx.GetInput(&docID); err != nil {
		return nil, err
	}
	return docID, nil
}
