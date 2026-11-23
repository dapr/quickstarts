package main

import (
	"context"
	"encoding/json"
	"fmt"
)

// inventoryStore is the name of the state store component (state.in-memory).
const inventoryStore = "inventory"

// createDefaultInventory makes sure that there is enough inventory for the
// order of this tutorial.
func createDefaultInventory(ctx context.Context) error {
	item := ProductInventoryItem{ProductID: "RBD001", ProductName: "Rubber Duck", Quantity: 50}
	return saveInventoryItem(ctx, item)
}

func saveInventoryItem(ctx context.Context, item ProductInventoryItem) error {
	data, err := json.Marshal(item)
	if err != nil {
		return err
	}
	return daprClient.SaveState(ctx, inventoryStore, item.ProductID, data, nil)
}

// getInventoryItem returns the inventory record of a product, or nil when the
// product is not in the state store.
func getInventoryItem(ctx context.Context, productID string) (*ProductInventoryItem, error) {
	state, err := daprClient.GetState(ctx, inventoryStore, productID, nil)
	if err != nil {
		return nil, err
	}
	if len(state.Value) == 0 {
		fmt.Println("get_inventory_item: no state response")
		return nil, nil
	}
	var item ProductInventoryItem
	if err := json.Unmarshal(state.Value, &item); err != nil {
		return nil, err
	}
	fmt.Printf("get_inventory_item: %+v\n", item)
	return &item, nil
}

// checkInventory reports whether the inventory has enough of the product.
func checkInventory(ctx context.Context, orderItem OrderItem) (bool, error) {
	item, err := getInventoryItem(ctx, orderItem.ProductID)
	if err != nil || item == nil {
		return false, err
	}
	return item.Quantity >= orderItem.Quantity, nil
}

// updateInventory subtracts the quantity of the order from the inventory.
func updateInventory(ctx context.Context, orderItem OrderItem) (ActivityResult, error) {
	item, err := getInventoryItem(ctx, orderItem.ProductID)
	if err != nil {
		return ActivityResult{}, err
	}
	if item == nil {
		return ActivityResult{Message: fmt.Sprintf("Product not in inventory: %s", orderItem.ProductName)}, nil
	}
	if item.Quantity < orderItem.Quantity {
		return ActivityResult{Message: fmt.Sprintf("Inventory not sufficient for: %s", orderItem.ProductName)}, nil
	}
	item.Quantity -= orderItem.Quantity
	if err := saveInventoryItem(ctx, *item); err != nil {
		return ActivityResult{}, err
	}
	return ActivityResult{IsSuccess: true, Message: fmt.Sprintf("Inventory updated for %s", orderItem.ProductName)}, nil
}
