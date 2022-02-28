package main

import (
	"context"
	"log"
	"strconv"
	"time"

	dapr "github.com/dapr/go-sdk/client"
)

var (
	PUBSUB_NAME  = "order_pub_sub"
	PUBSUB_TOPIC = "orders"
)

func main() {
	client, err := dapr.NewClient()
	if err != nil {
		panic(err)
	}
	defer client.Close()
	ctx := context.Background()
	for i := 1; i <= 10; i++ {
		order := "{\"orderId\":" + strconv.Itoa(i) + "}"

		// Dapr subscription routes orders topic to this route
		if err := client.PublishEvent(ctx, PUBSUB_NAME, PUBSUB_TOPIC, []byte(order)); err != nil {
			panic(err)
		}

		log.Println("Published data: " + order)

		time.Sleep(1000)
	}
}
