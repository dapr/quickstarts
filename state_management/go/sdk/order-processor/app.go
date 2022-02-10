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
		time.Sleep(5000)
		orderId := rand.Intn(1000-1) + 1
		client, err := dapr.NewClient()
		STATE_STORE_NAME := "statestore"
		if err != nil {
			panic(err)
		}
		ctx := context.Background()
		// Save state into the state store
		if err := client.SaveState(ctx, STATE_STORE_NAME, "orderId", []byte(strconv.Itoa(orderId))); err != nil {
			panic(err)
		}
		// Get state from the state store
		result, err := client.GetState(ctx, STATE_STORE_NAME, "orderId")
		if err != nil {
			panic(err)
		}
		log.Println("Result after get: ")
		log.Println(string(result.Value))
		// Delete state from the state store
		if err := client.DeleteState(ctx, STATE_STORE_NAME, "orderId"); err != nil {
			panic(err)
		}
		log.Println("Order requested: " + strconv.Itoa(orderId))
		log.Println("Result: ")
		log.Println(string(result.Value))
	}
}
