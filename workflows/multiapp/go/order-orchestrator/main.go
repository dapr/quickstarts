package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/dapr/durabletask-go/workflow"
	"github.com/dapr/go-sdk/client"
)

func main() {
	// Create a workflow registry
	registry := workflow.NewRegistry()

	// Register the workflow
	registry.AddWorkflow(OrderProcessingWorkflow)

	log.Println("OrderProcessingWorkflow registered")

	// Register local activities
	registry.AddActivity(ValidateOrderActivity)
	registry.AddActivity(CompleteOrderActivity)

	log.Println("ValidateOrderActivity registered")
	log.Println("CompleteOrderActivity registered")

	// Create a workflow client using the new vanity client
	wclient, err := client.NewWorkflowClient()
	if err != nil {
		log.Fatalf("Failed to create workflow client: %v", err)
	}
	log.Println("Workflow client initialized")

	// Start the workflow worker
	ctx := context.Background()
	if err := wclient.StartWorker(ctx, registry); err != nil {
		log.Fatalf("Failed to start workflow worker: %v", err)
	}
	log.Println("Workflow worker started")

	// Start HTTP server for health checks and workflow triggering
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Order Orchestrator is running"))
	})

	http.HandleFunc("/start-workflow", func(w http.ResponseWriter, r *http.Request) {
		log.Println("Starting workflow execution via HTTP endpoint...")

		// Create a sample order
		order := OrderRequest{
			OrderID:    "ORDER-001",
			CustomerID: "CUST-001",
			Items: []Item{
				{ProductID: "PROD-001", Name: "Laptop", Price: 999.99, Quantity: 1},
				{ProductID: "PROD-002", Name: "Mouse", Price: 29.99, Quantity: 2},
			},
			PaymentMethod: "credit_card",
		}
		// Calculate the total from items
		order.CalculateTotal()

		log.Printf("Scheduling workflow with input: %+v", order)
		instanceID := fmt.Sprintf("ORDER-%d", time.Now().Unix())
		_, err := wclient.ScheduleWorkflow(ctx, "OrderProcessingWorkflow",
			workflow.WithInstanceID(instanceID),
			workflow.WithInput(order))
		if err != nil {
			log.Printf("Failed to start workflow: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(fmt.Sprintf("Failed to start workflow: %v", err)))
			return
		}

		log.Printf("Workflow scheduled successfully with instance ID: %s", instanceID)

		log.Println("Waiting for workflow completion...")
		waitCtx, waitCancel := context.WithTimeout(context.Background(), 60*time.Second)
		result, err := wclient.WaitForWorkflowCompletion(waitCtx, instanceID)
		waitCancel()
		if err != nil {
			log.Printf("Failed to wait for workflow completion: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(fmt.Sprintf("Failed to wait for workflow completion: %v", err)))
		} else {
			log.Printf("Workflow completed successfully with result: %+v", result)
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(fmt.Sprintf("Workflow completed successfully: %+v", result)))
		}
	})

	log.Println("Starting HTTP server on port 50001...")
	log.Fatal(http.ListenAndServe(":50001", nil))
}

// OrderProcessingWorkflow orchestrates the entire order processing workflow
func OrderProcessingWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	log.Println("=== OrderProcessingWorkflow STARTED ===")

	var input OrderRequest
	if err := ctx.GetInput(&input); err != nil {
		return nil, fmt.Errorf("failed to get workflow input: %w", err)
	}
	log.Printf("Processing order: %s for customer: %s", input.OrderID, input.CustomerID)
	log.Printf("Full input: %+v", input)

	// Step 1: Validate Order (local activity)
	var validationResult OrderValidationResult
	if err := ctx.CallActivity("ValidateOrderActivity",
		workflow.WithActivityInput(input)).Await(&validationResult); err != nil {
		return nil, fmt.Errorf("order validation failed: %w", err)
	}

	// Step 2: Process Payment (call Java payment service)
	log.Println("=== STEP 2: Starting Payment Processing activity on payment-service ===")
	var paymentResult string
	if err := ctx.CallActivity("io.dapr.quickstarts.workflows.activities.ValidatePaymentMethodActivity",
		workflow.WithActivityInput(input),
		workflow.WithActivityAppID("payment-service")).Await(&paymentResult); err != nil {
		log.Printf("ERROR: Payment processing failed with error: %v", err)
		return nil, fmt.Errorf("payment processing failed: %w", err)
	}
	log.Println("=== STEP 2: Payment Processing COMPLETED ===")

	// Step 3: Reserve Inventory (call inventory-service)
	log.Println("=== STEP 3: Starting Inventory Reservation activity on inventory-service ===")
	var inventoryResult InventoryResult
	if err := ctx.CallActivity("io.dapr.quickstarts.workflows.activities.ReserveInventoryActivity",
		workflow.WithActivityInput(input),
		workflow.WithActivityAppID("inventory-service")).Await(&inventoryResult); err != nil {
		log.Printf("ERROR: Inventory reservation failed with error: %v", err)
		return nil, fmt.Errorf("inventory reservation failed: %w", err)
	}
	log.Println("=== STEP 3: Inventory Reservation COMPLETED ===")

	// Step 4: Generate AI Recommendations (call AI recommendation service)
	log.Println("=== STEP 4: Starting AI Recommendations activity on ai-recommendation-service ===")
	var recommendationResult RecommendationResult
	if err := ctx.CallActivity("io.dapr.quickstarts.workflows.activities.GeneratePersonalizedRecommendationsActivity",
		workflow.WithActivityInput(input),
		workflow.WithActivityAppID("ai-recommendation-service")).Await(&recommendationResult); err != nil {
		log.Printf("ERROR: AI recommendations failed with error: %v", err)
		return nil, fmt.Errorf("AI recommendations failed: %w", err)
	}
	log.Println("=== STEP 4: AI Recommendations COMPLETED ===")

	// Step 5: Complete Order (local activity)
	log.Println("=== STEP 5: Starting Order Completion activity (local) ===")
	var orderResult OrderResult
	if err := ctx.CallActivity("CompleteOrderActivity", workflow.WithActivityInput(input)).Await(&orderResult); err != nil {
		log.Printf("ERROR: Order completion failed with error: %v", err)
		return nil, fmt.Errorf("order completion failed: %w", err)
	}
	log.Println("=== STEP 5: Order Completion COMPLETED ===")

	// Create final result with all working steps
	finalResult := map[string]interface{}{
		"validation":      validationResult,
		"payment":         paymentResult,
		"inventory":       inventoryResult,
		"recommendations": recommendationResult,
		"order":           orderResult,
	}

	log.Println("=== OrderProcessingWorkflow COMPLETED SUCCESSFULLY ===")
	return finalResult, nil
}

// ValidateOrderActivity validates the order locally
func ValidateOrderActivity(ctx workflow.ActivityContext) (any, error) {
	log.Println("=== ValidateOrderActivity (local) STARTED ===")

	var input OrderRequest
	if err := ctx.GetInput(&input); err != nil {
		return nil, fmt.Errorf("failed to get activity input: %w", err)
	}
	log.Printf("Validating order: %s", input.OrderID)

	// Simulate validation logic
	time.Sleep(1 * time.Second)

	result := OrderValidationResult{
		Valid:   true,
		Total:   input.Total,
		Message: "Order validation successful",
	}

	log.Println("=== ValidateOrderActivity (local) COMPLETED ===")
	return result, nil
}

// CompleteOrderActivity completes the order locally
func CompleteOrderActivity(ctx workflow.ActivityContext) (any, error) {
	log.Println("=== CompleteOrderActivity (local) STARTED ===")

	var input OrderRequest
	if err := ctx.GetInput(&input); err != nil {
		return nil, fmt.Errorf("failed to get activity input: %w", err)
	}
	log.Printf("Completing order: %s", input.OrderID)

	// Simulate order completion logic
	time.Sleep(1 * time.Second)

	result := OrderResult{
		OrderID:    input.OrderID,
		CustomerID: input.CustomerID,
		Status:     "completed",
		Total:      input.Total,
		Message:    "Order completed successfully",
	}

	log.Println("=== CompleteOrderActivity (local) COMPLETED ===")
	return result, nil
}
