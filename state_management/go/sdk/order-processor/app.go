package main

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"time"

	dapr "github.com/dapr/go-sdk/client"
)

const stateStoreComponentName = "statestore"

func main() {
	client, err := dapr.NewClient()
	if err != nil {
		log.Fatal(err)
	}

	for i := 1; i <= 100; i++ {
		orderId := i
		order := `{"orderId":` + strconv.Itoa(orderId) + "}"

		// Save state into the state store
		err = client.SaveState(context.Background(), stateStoreComponentName, strconv.Itoa(orderId), []byte(order), nil)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println("Saved Order:", string(order))

		// Get state from the state store
		result, err := client.GetState(context.Background(), stateStoreComponentName, strconv.Itoa(orderId), nil)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println("Retrieved Order:", string(result.Value))

		// Delete state from the state store
		err = client.DeleteState(context.Background(), stateStoreComponentName, strconv.Itoa(orderId), nil)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println("Deleted Order:", string(order))

		time.Sleep(5000)
	}
}
