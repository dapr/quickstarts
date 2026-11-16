package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/dapr/durabletask-go/api"
	"github.com/dapr/durabletask-go/workflow"
	"github.com/dapr/go-sdk/client"
)

var (
	stateStoreName    = "statestore"
	workflowComponent = "dapr"
	workflowName      = "OrderProcessingWorkflow"
	defaultItemName   = "cars"
)

// quietLogger hides the informational lines of the workflow SDK. It prints warnings and errors.
type quietLogger struct{}

func (quietLogger) Debug(v ...any)            {}
func (quietLogger) Debugf(string, ...any)     {}
func (quietLogger) Info(v ...any)             {}
func (quietLogger) Infof(string, ...any)      {}
func (quietLogger) Warn(v ...any)             { log.Print(v...) }
func (quietLogger) Warnf(f string, v ...any)  { log.Printf(f, v...) }
func (quietLogger) Error(v ...any)            { log.Print(v...) }
func (quietLogger) Errorf(f string, v ...any) { log.Printf(f, v...) }

func main() {
	fmt.Println("*** Welcome to the Dapr Workflow console app sample!")
	fmt.Println("*** Using this app, you can place orders that start workflows.")

	r := workflow.NewRegistry()

	if err := r.AddWorkflow(OrderProcessingWorkflow); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(NotifyActivity); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(RequestApprovalActivity); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(VerifyInventoryActivity); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(ProcessPaymentActivity); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(UpdateInventoryActivity); err != nil {
		log.Fatal(err)
	}

	dclient, err := client.NewClient()
	if err != nil {
		log.Fatal(err)
	}
	wfClient := workflow.NewClientWithLogger(dclient.GrpcClientConn(), quietLogger{})

	if err := wfClient.StartWorker(context.Background(), r); err != nil {
		log.Fatal(err)
	}

	inventory := []InventoryItem{
		{ItemName: "paperclip", PerItemCost: 5, Quantity: 100},
		{ItemName: "cars", PerItemCost: 5000, Quantity: 10},
		{ItemName: "computers", PerItemCost: 500, Quantity: 100},
	}
	if err := restockInventory(dclient, inventory); err != nil {
		log.Fatalf("failed to restock: %v", err)
	}

	// The order id comes from ORDER_ID. Run the app again with the same id to attach to the same order.
	orderID := os.Getenv("ORDER_ID")
	if orderID == "" {
		orderID = "order-" + time.Now().Format("20060102-150405")
	}
	fmt.Printf("Order ID: %s\n", orderID)

	// Two cars at 5000 each: the total is over 5000, so the workflow waits for approval.
	orderQuantity := 2
	orderPayload := OrderPayload{
		ItemName:  defaultItemName,
		Quantity:  orderQuantity,
		TotalCost: inventory[1].PerItemCost * orderQuantity,
	}

	ctx := context.Background()
	meta, err := wfClient.FetchWorkflowMetadata(ctx, orderID)
	switch {
	case err == nil:
		switch meta.String() {
		case "RUNNING", "PENDING", "SUSPENDED":
			fmt.Printf("Order %s is already running. Waiting for it to finish.\n", orderID)
		default:
			fmt.Printf("Workflow completed: %s\n", meta.String())
			return
		}
	case errors.Is(err, api.ErrInstanceNotFound):
		if _, err := wfClient.ScheduleWorkflow(ctx, workflowName, workflow.WithInstanceID(orderID), workflow.WithInput(orderPayload)); err != nil {
			log.Fatalf("failed to start workflow: %v", err)
		}
		fmt.Printf("Started order %s.\n", orderID)
	default:
		log.Fatalf("failed to get workflow: %v", err)
	}

	waitCtx, cancel := context.WithTimeout(ctx, 20*time.Minute)
	defer cancel()
	respFetch, err := wfClient.WaitForWorkflowCompletion(waitCtx, orderID)
	if err != nil {
		log.Fatalf("failed to wait for workflow: %v", err)
	}

	fmt.Printf("Workflow completed: %s\n", respFetch.String())
}

func restockInventory(daprClient client.Client, inventory []InventoryItem) error {
	for _, item := range inventory {
		existing, err := daprClient.GetState(context.Background(), stateStoreName, item.ItemName, nil)
		if err != nil {
			return err
		}
		if existing != nil && len(existing.Value) > 0 {
			continue
		}
		itemSerialized, err := json.Marshal(item)
		if err != nil {
			return err
		}
		fmt.Printf("adding base stock item: %s\n", item.ItemName)
		if err := daprClient.SaveState(context.Background(), stateStoreName, item.ItemName, itemSerialized, nil); err != nil {
			return err
		}
	}
	return nil
}
