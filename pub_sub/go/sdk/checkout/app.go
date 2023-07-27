package main

import (
	"context"
	"fmt"
	"strconv"
	"time"

	dapr "github.com/dapr/go-sdk/client"
)

const (
	pubsubComponentName = "orderpubsub"
	pubsubTopic         = "orders"
)

func main() {
	// Create a new client for Dapr using the SDK
	client, err := dapr.NewClient()
	if err != nil {
		panic(err)
	}
	defer client.Close()

	// Publish events using Dapr pubsub
	for i := 1; i <= 10; i++ {
		order := `{"orderId":` + strconv.Itoa(i) + `}`

		err := client.PublishEvent(context.Background(), pubsubComponentName, pubsubTopic, []byte(order))
		if err != nil {
			panic(err)
		}

		fmt.Println("Published data:", order)

		time.Sleep(time.Second)
	}
}
