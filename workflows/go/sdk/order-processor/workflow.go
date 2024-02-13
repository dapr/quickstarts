package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/dapr/go-sdk/client"
	"github.com/dapr/go-sdk/workflow"
)

// OrderProcessingWorkflow is the main workflow for orchestrating activities in the order process.
func OrderProcessingWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	orderID := ctx.InstanceID()
	var orderPayload OrderPayload
	if err := ctx.GetInput(&orderPayload); err != nil {
		return nil, err
	}
	err := ctx.CallActivity(NotifyActivity, workflow.ActivityInput(Notification{
		Message: fmt.Sprintf("Received order %s for %d %s - $%d", orderID, orderPayload.Quantity, orderPayload.ItemName, orderPayload.TotalCost),
	})).Await(nil)
	if err != nil {
		return OrderResult{Processed: false}, err
	}

	var verifyInventoryResult InventoryResult
	if err := ctx.CallActivity(VerifyInventoryActivity, workflow.ActivityInput(InventoryRequest{
		RequestID: orderID,
		ItemName:  orderPayload.ItemName,
		Quantity:  orderPayload.Quantity,
	})).Await(&verifyInventoryResult); err != nil {
		return OrderResult{Processed: false}, err
	}

	if !verifyInventoryResult.Success {
		notification := Notification{Message: fmt.Sprintf("Insufficient inventory for %s", orderPayload.ItemName)}
		err := ctx.CallActivity(NotifyActivity, workflow.ActivityInput(notification)).Await(nil)
		return OrderResult{Processed: false}, err
	}

	if orderPayload.TotalCost > 50000 {
		var approvalRequired ApprovalRequired
		if err := ctx.CallActivity(RequestApprovalActivity, workflow.ActivityInput(orderPayload)).Await(&approvalRequired); err != nil {
			return OrderResult{Processed: false}, err
		}
		if err := ctx.WaitForExternalEvent("manager_approval", time.Second*200).Await(nil); err != nil {
			return OrderResult{Processed: false}, err
		}
		// TODO: Confirm timeout flow - this will be in the form of an error.
		if approvalRequired.Approval {
			if err := ctx.CallActivity(NotifyActivity, workflow.ActivityInput(Notification{Message: fmt.Sprintf("Payment for order %s has been approved!", orderID)})).Await(nil); err != nil {
				log.Printf("failed to notify of a successful order: %v\n", err)
			}
		} else {
			if err := ctx.CallActivity(NotifyActivity, workflow.ActivityInput(Notification{Message: fmt.Sprintf("Payment for order %s has been rejected!", orderID)})).Await(nil); err != nil {
				log.Printf("failed to notify of an unsuccessful order :%v\n", err)
			}
			return OrderResult{Processed: false}, err
		}
	}
	err = ctx.CallActivity(ProcessPaymentActivity, workflow.ActivityInput(PaymentRequest{
		RequestID:          orderID,
		ItemBeingPurchased: orderPayload.ItemName,
		Amount:             orderPayload.TotalCost,
		Quantity:           orderPayload.Quantity,
	})).Await(nil)
	if err != nil {
		if err := ctx.CallActivity(NotifyActivity, workflow.ActivityInput(Notification{Message: fmt.Sprintf("Order %s failed!", orderID)})).Await(nil); err != nil {
			log.Printf("failed to notify of a failed order: %v", err)
		}
		return OrderResult{Processed: false}, err
	}

	err = ctx.CallActivity(UpdateInventoryActivity, workflow.ActivityInput(PaymentRequest{
		RequestID:          orderID,
		ItemBeingPurchased: orderPayload.ItemName,
		Amount:             orderPayload.TotalCost,
		Quantity:           orderPayload.Quantity,
	})).Await(nil)
	if err != nil {
		if err := ctx.CallActivity(NotifyActivity, workflow.ActivityInput(Notification{Message: fmt.Sprintf("Order %s failed!", orderID)})).Await(nil); err != nil {
			log.Printf("failed to notify of a failed order: %v", err)
		}
		return OrderResult{Processed: false}, err
	}

	if err := ctx.CallActivity(NotifyActivity, workflow.ActivityInput(Notification{Message: fmt.Sprintf("Order %s has completed!", orderID)})).Await(nil); err != nil {
		log.Printf("failed to notify of a successful order: %v", err)
	}
	return OrderResult{Processed: true}, err
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

// RequestApprovalActivity requests approval for the order
func RequestApprovalActivity(ctx workflow.ActivityContext) (any, error) {
	var input OrderPayload
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("RequestApprovalActivity: Requesting approval for payment of %dUSD for %d %s\n", input.TotalCost, input.Quantity, input.ItemName)
	return ApprovalRequired{Approval: true}, nil
}
