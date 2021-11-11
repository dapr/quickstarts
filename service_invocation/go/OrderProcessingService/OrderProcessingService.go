package main

import (
	"context"
	"log"
	"math/rand"
	"time"
	"strconv"
	dapr "github.com/dapr/go-sdk/client"

)

type Order struct {
	orderName string
	orderNum  string
}

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

		result, err := client.InvokeMethod(ctx, "checkoutservice", "checkout/" + strconv.Itoa(orderId), "get")

		log.Println("Order requested: " + strconv.Itoa(orderId))
		log.Println("Result: ")
		log.Println(result)
	}
}

