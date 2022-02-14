package main

import (
	"context"
	"log"
	"math/rand"
	"strconv"
	"time"

	dapr "github.com/dapr/go-sdk/client"
)

func main() {
	for {
		orderId := rand.Intn(1000-1) + 1
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
		log.Print("Getting Order: " + string(result.Value))

		// Delete state from the state store
		_ = client.DeleteState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId))
		log.Print("Deleting Order: " + string(order))

		time.Sleep(5000)
	}
}
