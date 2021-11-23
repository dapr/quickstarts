package main

import (
	"context"
	"log"
	"math/rand"
	"time"
	"strconv"
	dapr "github.com/dapr/go-sdk/client"

)

var (

	PUBSUB_NAME = "order_pub_sub"
	TOPIC_NAME  = "orders"
)

func main() {
	for i := 0; i < 10; i++ {
		time.Sleep(5000)
		orderId := rand.Intn(1000-1) + 1
		client, err := dapr.NewClient()
		if err != nil {
			panic(err)
		}
		defer client.Close()
		ctx := context.Background()

		if err := client.PublishEvent(ctx, PUBSUB_NAME, TOPIC_NAME, []byte(strconv.Itoa(orderId))); 
		err != nil {
			panic(err)
		}

		log.Println("Published data: " + strconv.Itoa(orderId))
	}
}

