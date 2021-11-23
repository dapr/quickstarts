package main

import (
	"context"
	"log"
	dapr "github.com/dapr/go-sdk/client"
)

func main() {
	client, err := dapr.NewClient()
	SECRET_STORE_NAME := "localsecretstore"
	if err != nil {
		panic(err)
	}
	defer client.Close()
	ctx := context.Background()

	secret, err := client.GetSecret(ctx, SECRET_STORE_NAME, "secret", nil)
	if err != nil {
		return nil, errors.Wrap(err, "Got error for accessing key")
	}

	if secret != nil {
		log.Println("Result : ")
		log.Println(secret)
	}

	secretRandom, err := client.GetBulkSecret(ctx, SECRET_STORE_NAME, nil)
	if err != nil {
		return nil, errors.Wrap(err, "Got error for accessing key")
	}

	if secret != nil {
		log.Println("Result for bulk: ")
		log.Println(secretRandom)
	}
}
