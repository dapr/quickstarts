package main

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"time"

	dapr "github.com/dapr/go-sdk/client"
)

func main() {
	for i := 1; i <= 10; i++ {
		orderId := i
		order := "{\"orderId\":" + strconv.Itoa(orderId) + "}"
		client, err := dapr.NewClient()
		STATE_STORE_NAME := "statestore"
		if err != nil {
			panic(err)
		}
		ctx := context.Background()

		// Save state into the state store
		_ = client.SaveState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId), []byte(order))
		log.Print("Saving Order: " + string(order))

		// Get state from the state store
		result, _ := client.GetState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId))
		fmt.Println("Getting Order: " + string(result.Value))

		// Delete state from the state store
		_ = client.DeleteState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId))
		log.Print("Deleting Order: " + string(order))

		time.Sleep(5000)
	}
}
