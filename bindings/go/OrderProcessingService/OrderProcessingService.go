package main

import (
	"context"
	"log"
	"math/rand"
	"time"
	"strconv"
	dapr "github.com/dapr/go-sdk/client"

)

func main() {
	BINDING_NAME := "checkout";
	BINDING_OPERATION := "create";
	for i := 0; i < 10; i++ {
		time.Sleep(5000)
		orderId := rand.Intn(1000-1) + 1
		client, err := dapr.NewClient()
		if err != nil {
			panic(err)
		}
		defer client.Close()
		ctx := context.Background()

		in := &dapr.InvokeBindingRequest{ Name: BINDING_NAME, Operation: BINDING_OPERATION , Data: []byte(strconv.Itoa(orderId))}
		err = client.InvokeOutputBinding(ctx, in)
		log.Println("Sending message: " + strconv.Itoa(orderId))
	}
}

