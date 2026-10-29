package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/dapr/durabletask-go/workflow"
	"github.com/dapr/go-sdk/client"
)

const (
	// shipmentRegisteredEvent is the name of the event that the shipping app
	// triggers, through pub/sub, when the shipment is registered.
	shipmentRegisteredEvent = "shipment-registered-events"
	// shipmentTimeout is how long the workflow waits for that event.
	shipmentTimeout = 5 * time.Minute

	pubsubComponent           = "shippingpubsub"
	pubsubRegistrationTopic   = "shipment-registration-events"
	shippingAppID             = "shipping"
	shippingCheckDestinationM = "checkDestination"
)

// daprClient is the Dapr client of the activities. main sets it.
var daprClient client.Client

// OrderWorkflow combines three patterns. It checks the inventory and the
// shipping destination at the same time (fan-out/fan-in), processes the
// payment and updates the inventory in sequence (task chaining), and waits for
// the shipment confirmation (external event). When the shipment fails, it
// reimburses the customer (compensation).
// Workflow code must be deterministic. Write any non-deterministic behavior
// inside activities.
func OrderWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var order Order
	if err := ctx.GetInput(&order); err != nil {
		return nil, err
	}
	if !ctx.IsReplaying() {
		fmt.Printf("order_workflow: Received order id: %s.\n", order.ID)
	}

	// Fan-out: two independent activities run at the same time.
	inventoryTask := ctx.CallActivity(CheckInventory, workflow.WithActivityInput(order.OrderItem))
	destinationTask := ctx.CallActivity(CheckShippingDestination, workflow.WithActivityInput(order.CustomerInfo))

	// Fan-in: wait for both of them.
	var inventoryResult, destinationResult ActivityResult
	if err := inventoryTask.Await(&inventoryResult); err != nil {
		return nil, err
	}
	if err := destinationTask.Await(&destinationResult); err != nil {
		return nil, err
	}
	for _, result := range []ActivityResult{inventoryResult, destinationResult} {
		if !result.IsSuccess {
			return OrderStatus{
				IsSuccess: false,
				Message:   fmt.Sprintf("Order processing failed. Reason: %s", result.Message),
			}, nil
		}
	}

	// Task chaining: UpdateInventory depends on the result of ProcessPayment.
	var paymentResult ActivityResult
	if err := ctx.CallActivity(ProcessPayment, workflow.WithActivityInput(order)).Await(&paymentResult); err != nil {
		return nil, err
	}
	if !ctx.IsReplaying() {
		fmt.Printf("order_workflow: Payment result: %+v.\n", paymentResult)
	}
	if paymentResult.IsSuccess {
		if err := ctx.CallActivity(UpdateInventory, workflow.WithActivityInput(order.OrderItem)).Await(nil); err != nil {
			return nil, err
		}
	}

	// RegisterShipment uses pub/sub messaging to talk to the shipping app.
	if err := ctx.CallActivity(RegisterShipment, workflow.WithActivityInput(order)).Await(nil); err != nil {
		return nil, err
	}

	// The shipping app uses pub/sub messaging to answer. The workflow app
	// turns that message into an event for this workflow instance. The
	// workflow waits for the event, but not for longer than the timeout.
	// When the timeout expires first, Await returns workflow.ErrTaskCanceled.
	var registration ShipmentRegistrationStatus
	err := ctx.WaitForExternalEvent(shipmentRegisteredEvent, shipmentTimeout).Await(&registration)
	if errors.Is(err, workflow.ErrTaskCanceled) {
		return OrderStatus{
			IsSuccess: false,
			Message:   fmt.Sprintf("Shipment registration status for %s timed out.", order.ID),
		}, nil
	}
	if err != nil {
		return nil, err
	}

	if !registration.IsSuccess {
		// Compensation: give the money back to the customer.
		if err := ctx.CallActivity(ReimburseCustomer, workflow.WithActivityInput(order)).Await(nil); err != nil {
			return nil, err
		}
		return OrderStatus{
			IsSuccess: false,
			Message:   fmt.Sprintf("Shipment registration status for %s failed. Customer is reimbursed.", order.ID),
		}, nil
	}
	return OrderStatus{
		IsSuccess: true,
		Message:   fmt.Sprintf("Order %s processed successfully.", order.ID),
	}, nil
}

// CheckInventory checks that the inventory has enough of the product.
func CheckInventory(ctx workflow.ActivityContext) (any, error) {
	var orderItem OrderItem
	if err := ctx.GetInput(&orderItem); err != nil {
		return nil, err
	}
	fmt.Printf("check_inventory: Received input: %+v.\n", orderItem)
	available, err := checkInventory(ctx.Context(), orderItem)
	if err != nil {
		return nil, err
	}
	return ActivityResult{IsSuccess: available}, nil
}

// CheckShippingDestination asks the shipping app, with service invocation,
// if it can ship to the country of the customer.
func CheckShippingDestination(ctx workflow.ActivityContext) (any, error) {
	var customer CustomerInfo
	if err := ctx.GetInput(&customer); err != nil {
		return nil, err
	}
	fmt.Printf("check_shipping_destination: Received input: %+v.\n", customer)

	body, err := json.Marshal(customer)
	if err != nil {
		return nil, err
	}
	response, err := daprClient.InvokeMethodWithContent(ctx.Context(), shippingAppID, shippingCheckDestinationM, "POST",
		&client.DataContent{Data: body, ContentType: "application/json"})
	if err != nil {
		return nil, fmt.Errorf("failed to check the shipping destination: %w", err)
	}
	var result ShippingDestinationResult
	if err := json.Unmarshal(response, &result); err != nil {
		return nil, err
	}
	return ActivityResult{IsSuccess: result.IsSuccess, Message: result.Message}, nil
}

// ProcessPayment processes the payment of the order.
func ProcessPayment(ctx workflow.ActivityContext) (any, error) {
	var order Order
	if err := ctx.GetInput(&order); err != nil {
		return nil, err
	}
	fmt.Printf("process_payment: Received input: %+v.\n", order)
	// Imagine the payment being processed by another system
	return ActivityResult{IsSuccess: true}, nil
}

// UpdateInventory subtracts the quantity of the order from the inventory.
func UpdateInventory(ctx workflow.ActivityContext) (any, error) {
	var orderItem OrderItem
	if err := ctx.GetInput(&orderItem); err != nil {
		return nil, err
	}
	fmt.Printf("update_inventory: Received input: %+v.\n", orderItem)
	return updateInventory(ctx.Context(), orderItem)
}

// RegisterShipment publishes the order to the shipping app, with pub/sub.
func RegisterShipment(ctx workflow.ActivityContext) (any, error) {
	var order Order
	if err := ctx.GetInput(&order); err != nil {
		return nil, err
	}
	fmt.Printf("register_shipment: Received input: %+v.\n", order)
	if err := daprClient.PublishEvent(ctx.Context(), pubsubComponent, pubsubRegistrationTopic, order); err != nil {
		return nil, err
	}
	return ActivityResult{IsSuccess: true}, nil
}

// ReimburseCustomer gives the money of the order back to the customer. It is
// the compensation action of the workflow.
func ReimburseCustomer(ctx workflow.ActivityContext) (any, error) {
	var order Order
	if err := ctx.GetInput(&order); err != nil {
		return nil, err
	}
	fmt.Printf("reimburse_customer: Received input: %+v.\n", order)
	// Imagine the money being sent back to the customer
	return ActivityResult{IsSuccess: true}, nil
}
