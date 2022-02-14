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
		if err := client.SaveState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId), []byte(order)); err != nil {
			panic(err)
		}
		log.Print("Saving Order: " + string(order))

		// Get state from the state store
		result, err := client.GetState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId))
		if err != nil {
			panic(err)
		}
		log.Print("Getting Order: " + string(result.Value))

		// Delete state from the state store
		if err := client.DeleteState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId)); err != nil {
			panic(err)
		}
		log.Print("Deleted Order: " + string(order))

		time.Sleep(5000)
	}
}
