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

var (
	stateStoreName    = "statestore"
	workflowComponent = "dapr"
	workflowName      = "OrderProcessingWorkflow"
	defaultItemName   = "cars"
)

func main() {
	fmt.Println("*** Welcome to the Dapr Workflow console app sample!")
	fmt.Println("*** Using this app, you can place orders that start workflows.")

	w, err := workflow.NewWorker()
	if err != nil {
		log.Fatalf("failed to start worker: %v", err)
	}

	if err := w.RegisterWorkflow(OrderProcessingWorkflow); err != nil {
		log.Fatal(err)
	}
	if err := w.RegisterActivity(NotifyActivity); err != nil {
		log.Fatal(err)
	}
	if err := w.RegisterActivity(RequestApprovalActivity); err != nil {
		log.Fatal(err)
	}
	if err := w.RegisterActivity(VerifyInventoryActivity); err != nil {
		log.Fatal(err)
	}
	if err := w.RegisterActivity(ProcessPaymentActivity); err != nil {
		log.Fatal(err)
	}
	if err := w.RegisterActivity(UpdateInventoryActivity); err != nil {
		log.Fatal(err)
	}

	if err := w.Start(); err != nil {
		log.Fatal(err)
	}

	daprClient, err := client.NewClient()
	if err != nil {
		log.Fatalf("failed to initialise dapr client: %v", err)
	}
	wfClient, err := workflow.NewClient(workflow.WithDaprClient(daprClient))
	if err != nil {
		log.Fatalf("failed to initialise workflow client: %v", err)
	}

	inventory := []InventoryItem{
		{ItemName: "paperclip", PerItemCost: 5, Quantity: 100},
		{ItemName: "cars", PerItemCost: 15000, Quantity: 100},
		{ItemName: "computers", PerItemCost: 500, Quantity: 100},
	}
	if err := restockInventory(daprClient, inventory); err != nil {
		log.Fatalf("failed to restock: %v", err)
	}

	fmt.Println("==========Begin the purchase of item:==========")

	itemName := defaultItemName
	orderQuantity := 10

	totalCost := inventory[1].PerItemCost * orderQuantity

	orderPayload := OrderPayload{
		ItemName:  itemName,
		Quantity:  orderQuantity,
		TotalCost: totalCost,
	}

	id, err := wfClient.ScheduleNewWorkflow(context.Background(), workflowName, workflow.WithInput(orderPayload))
	if err != nil {
		log.Fatalf("failed to start workflow: %v", err)
	}

	approvalSought := false

	startTime := time.Now()

	for {
		timeDelta := time.Since(startTime)
		metadata, err := wfClient.FetchWorkflowMetadata(context.Background(), id)
		if err != nil {
			log.Fatalf("failed to fetch workflow: %v", err)
		}
		if (metadata.RuntimeStatus == workflow.StatusCompleted) || (metadata.RuntimeStatus == workflow.StatusFailed) || (metadata.RuntimeStatus == workflow.StatusTerminated) {
			fmt.Printf("Workflow completed - result: %v\n", metadata.RuntimeStatus.String())
			break
		}
		if timeDelta.Seconds() >= 10 {
			metadata, err := wfClient.FetchWorkflowMetadata(context.Background(), id)
			if err != nil {
				log.Fatalf("failed to fetch workflow: %v", err)
			}
			if totalCost > 50000 && !approvalSought && ((metadata.RuntimeStatus != workflow.StatusCompleted) || (metadata.RuntimeStatus != workflow.StatusFailed) || (metadata.RuntimeStatus != workflow.StatusTerminated)) {
				approvalSought = true
				promptForApproval(id)
			}
		}
		// Sleep before the next iteration
		time.Sleep(time.Second)
	}

	fmt.Println("Purchase of item is complete")
}

// promptForApproval is an example case. There is no user input required here due to this being for testing purposes only.
// It would be perfectly valid to add a wait here or display a prompt to continue the process.
func promptForApproval(id string) {
	wfClient, err := workflow.NewClient()
	if err != nil {
		log.Fatalf("failed to initialise wfClient: %v", err)
	}
	if err := wfClient.RaiseEvent(context.Background(), id, "manager_approval"); err != nil {
		log.Fatal(err)
	}
}

func restockInventory(daprClient client.Client, inventory []InventoryItem) error {
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
