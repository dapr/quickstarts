package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/dapr/durabletask-go/workflow"
	"github.com/dapr/go-sdk/client"
)

// OrderProcessingWorkflow is the main workflow for orchestrating activities in the order process.
func OrderProcessingWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	orderID := ctx.ID()
	var orderPayload OrderPayload
	if err := ctx.GetInput(&orderPayload); err != nil {
		return nil, err
	}

	err := ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{
		Message: fmt.Sprintf("Received order %s for %d %s - $%d", orderID, orderPayload.Quantity, orderPayload.ItemName, orderPayload.TotalCost),
	})).Await(nil)
	if err != nil {
		return OrderResult{Processed: false}, err
	}

	var verifyInventoryResult InventoryResult
	if err := ctx.CallActivity(VerifyInventoryActivity, workflow.WithActivityInput(InventoryRequest{
		RequestID: orderID,
		ItemName:  orderPayload.ItemName,
		Quantity:  orderPayload.Quantity,
	})).Await(&verifyInventoryResult); err != nil {
		return OrderResult{Processed: false}, err
	}

	if !verifyInventoryResult.Success {
		notification := Notification{Message: fmt.Sprintf("Insufficient inventory for %s", orderPayload.ItemName)}
		err := ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(notification)).Await(nil)
		return OrderResult{Processed: false}, err
	}

	if orderPayload.TotalCost > 5000 {
		if err := ctx.CallActivity(RequestApprovalActivity, workflow.WithActivityInput(ApprovalRequest{
			RequestID: orderID,
			Quantity:  orderPayload.Quantity,
			ItemName:  orderPayload.ItemName,
			TotalCost: orderPayload.TotalCost,
		})).Await(nil); err != nil {
			return OrderResult{Processed: false}, err
		}
		var rawApproval json.RawMessage
		if err := ctx.WaitForExternalEvent("ApprovalEvent", 10*time.Minute).Await(&rawApproval); err != nil {
			if errors.Is(err, workflow.ErrTaskCanceled) {
				if nerr := ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{Message: fmt.Sprintf("Order %s was cancelled: no approval within 10 minutes", orderID)})).Await(nil); nerr != nil {
					return OrderResult{Processed: false}, nerr
				}
			}
			return OrderResult{Processed: false}, err
		}
		approval, err := parseApproval(rawApproval)
		if err != nil {
			return OrderResult{Processed: false}, err
		}
		if !approval.Approved {
			if err := ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{Message: fmt.Sprintf("Payment for order %s has been rejected!", orderID)})).Await(nil); err != nil {
				return OrderResult{Processed: false}, err
			}
			return OrderResult{Processed: false}, nil
		}
		if err := ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{Message: fmt.Sprintf("Payment for order %s has been approved!", orderID)})).Await(nil); err != nil {
			return OrderResult{Processed: false}, err
		}
	}
	err = ctx.CallActivity(ProcessPaymentActivity, workflow.WithActivityInput(PaymentRequest{
		RequestID:          orderID,
		ItemBeingPurchased: orderPayload.ItemName,
		Amount:             orderPayload.TotalCost,
		Quantity:           orderPayload.Quantity,
	})).Await(nil)
	if err != nil {
		_ = ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{Message: fmt.Sprintf("Order %s failed!", orderID)})).Await(nil)
		return OrderResult{Processed: false}, err
	}

	err = ctx.CallActivity(UpdateInventoryActivity, workflow.WithActivityInput(PaymentRequest{
		RequestID:          orderID,
		ItemBeingPurchased: orderPayload.ItemName,
		Amount:             orderPayload.TotalCost,
		Quantity:           orderPayload.Quantity,
	})).Await(nil)
	if err != nil {
		_ = ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{Message: fmt.Sprintf("Order %s failed!", orderID)})).Await(nil)
		return OrderResult{Processed: false}, err
	}

	_ = ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{Message: fmt.Sprintf("Order %s has completed!", orderID)})).Await(nil)
	return OrderResult{Processed: true}, nil
}

// parseApproval reads the payload of ApprovalEvent. The Dapr CLI sends the --input text as a JSON string,
// so the payload can be the object {"approved": true} or a string that holds that object.
func parseApproval(raw json.RawMessage) (ApprovalResponse, error) {
	var approval ApprovalResponse
	var text string
	if err := json.Unmarshal(raw, &text); err == nil {
		raw = json.RawMessage(text)
	}
	if err := json.Unmarshal(raw, &approval); err != nil {
		return approval, fmt.Errorf("invalid approval payload %s: %w", string(raw), err)
	}
	return approval, nil
}

// NotifyActivity outputs a notification message
func NotifyActivity(ctx workflow.ActivityContext) (any, error) {
	var input Notification
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	fmt.Printf("NotifyActivity: %s\n", input.Message)
	return nil, nil
}

// ProcessPaymentActivity is used to process a payment
func ProcessPaymentActivity(ctx workflow.ActivityContext) (any, error) {
	var input PaymentRequest
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	fmt.Printf("ProcessPaymentActivity: %s for %d - %s (%dUSD)\n", input.RequestID, input.Quantity, input.ItemBeingPurchased, input.Amount)
	return nil, nil
}

// VerifyInventoryActivity is used to verify if an item is available in the inventory
func VerifyInventoryActivity(ctx workflow.ActivityContext) (any, error) {
	var input InventoryRequest
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("VerifyInventoryActivity: Verifying inventory for order %s of %d %s\n", input.RequestID, input.Quantity, input.ItemName)
	dClient, err := client.NewClient()
	if err != nil {
		return nil, err
	}
	item, err := dClient.GetState(context.Background(), stateStoreName, input.ItemName, nil)
	if err != nil {
		return nil, err
	}
	if item == nil {
		return InventoryResult{
			Success:       false,
			InventoryItem: InventoryItem{},
		}, nil
	}
	var result InventoryItem
	if err := json.Unmarshal(item.Value, &result); err != nil {
		log.Fatalf("failed to parse inventory result %v", err)
	}
	fmt.Printf("VerifyInventoryActivity: There are %d %s available for purchase\n", result.Quantity, result.ItemName)
	if result.Quantity >= input.Quantity {
		return InventoryResult{Success: true, InventoryItem: result}, nil
	}
	return InventoryResult{Success: false, InventoryItem: InventoryItem{}}, nil
}

// UpdateInventoryActivity modifies the inventory.
func UpdateInventoryActivity(ctx workflow.ActivityContext) (any, error) {
	var input PaymentRequest
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("UpdateInventoryActivity: Checking Inventory for order %s for %d * %s\n", input.RequestID, input.Quantity, input.ItemBeingPurchased)
	dClient, err := client.NewClient()
	if err != nil {
		return nil, err
	}
	item, err := dClient.GetState(context.Background(), stateStoreName, input.ItemBeingPurchased, nil)
	if err != nil {
		return nil, err
	}
	var result InventoryItem
	err = json.Unmarshal(item.Value, &result)
	if err != nil {
		return nil, err
	}
	newQuantity := result.Quantity - input.Quantity
	if newQuantity < 0 {
		return nil, fmt.Errorf("insufficient inventory for: %s", input.ItemBeingPurchased)
	}
	result.Quantity = newQuantity
	newState, err := json.Marshal(result)
	if err != nil {
		log.Fatalf("failed to marshal new state: %v", err)
	}
	dClient.SaveState(context.Background(), stateStoreName, input.ItemBeingPurchased, newState, nil)
	fmt.Printf("UpdateInventoryActivity: There are now %d %s left in stock\n", result.Quantity, result.ItemName)
	return InventoryResult{Success: true, InventoryItem: result}, nil
}

// RequestApprovalActivity requests approval for the order. The workflow then waits for ApprovalEvent.
func RequestApprovalActivity(ctx workflow.ActivityContext) (any, error) {
	var input ApprovalRequest
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("Approval requested for order %s. Waiting for approval.\n", input.RequestID)
	return nil, nil
}
