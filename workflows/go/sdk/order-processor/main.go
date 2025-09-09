package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/dapr/durabletask-go/workflow"
	dapr "github.com/dapr/go-sdk/client"
)

var (
	stateStoreName    = "statestore"
	workflowComponent = "dapr"
	workflowName      = "OrderProcessingWorkflow"
	defaultItemName   = "cars"
)

func main() {
	fmt.Println("*** Welcome to the Dapr Workflow console app sample!")
	fmt.Println("*** Using this app, you can place orders that start workflows.")

	registry := workflow.NewTaskRegistry()

	if err := registry.AddWorkflow(OrderProcessingWorkflow); err != nil {
		log.Fatal(err)
	}
	if err := registry.AddActivity(NotifyActivity); err != nil {
		log.Fatal(err)
	}
	if err := registry.AddActivity(RequestApprovalActivity); err != nil {
		log.Fatal(err)
	}
	if err := registry.AddActivity(VerifyInventoryActivity); err != nil {
		log.Fatal(err)
	}
	if err := registry.AddActivity(ProcessPaymentActivity); err != nil {
		log.Fatal(err)
	}
	if err := registry.AddActivity(UpdateInventoryActivity); err != nil {
		log.Fatal(err)
	}

	daprClient, err := dapr.NewClient()
	if err != nil {
		log.Fatalf("failed to create Dapr client: %v", err)
	}

	wfclient := workflow.NewClient(daprClient.GrpcClientConn())
	if err := wfclient.StartWorker(context.TODO(), registry); err != nil {
		log.Fatalf("failed to start work item listener: %v", err)
	}

	inventory := []InventoryItem{
		{ItemName: "paperclip", PerItemCost: 5, Quantity: 100},
		{ItemName: "cars", PerItemCost: 5000, Quantity: 10},
		{ItemName: "computers", PerItemCost: 500, Quantity: 100},
	}
	if err := restockInventory(daprClient, inventory); err != nil {
		log.Fatalf("failed to restock: %v", err)
	}

	fmt.Println("==========Begin the purchase of item:==========")

	itemName := defaultItemName
	orderQuantity := 1

	totalCost := inventory[1].PerItemCost * orderQuantity

	orderPayload := OrderPayload{
		ItemName:  itemName,
		Quantity:  orderQuantity,
		TotalCost: totalCost,
	}

	id, err := wfclient.ScheduleNewWorkflow(context.TODO(), workflowName,
		workflow.WithInput(orderPayload),
	)
	if err != nil {
		log.Fatalf("failed to start workflow: %v", err)
	}

	waitCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	_, err = wfclient.WaitForWorkflowCompletion(waitCtx, id)
	if err != nil {
		log.Fatalf("failed to wait for workflow: %v", err)
	}

	respFetch, err := wfclient.FetchWorkflowMetadata(context.Background(), id, workflow.WithFetchPayloads(true))
	if err != nil {
		log.Fatalf("failed to get workflow: %v", err)
	}

	fmt.Printf("workflow status: %v\n", respFetch.RuntimeStatus)

	fmt.Println("Purchase of item is complete")
}

func restockInventory(daprClient dapr.Client, inventory []InventoryItem) error {
	for _, item := range inventory {
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
