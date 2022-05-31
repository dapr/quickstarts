package main

import (
	"context"
	"fmt"

	dapr "github.com/dapr/go-sdk/client"
)

func main() {
	client, err := dapr.NewClient()
	const DAPR_SECRET_STORE = "localsecretstore"
	const SECRET_NAME = "secret"
	if err != nil {
		panic(err)
	}
	defer client.Close()
	ctx := context.Background()
	secret, err := client.GetSecret(ctx, DAPR_SECRET_STORE, SECRET_NAME, nil)
	if secret != nil {
		fmt.Println("Fetched Secret: ", secret[SECRET_NAME])
	}
}
