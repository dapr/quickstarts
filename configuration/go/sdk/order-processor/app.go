package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	dapr "github.com/dapr/go-sdk/client"
)

var DAPR_CONFIGURATION_STORE = "configstore"
var CONFIGURATION_KEYS = []string{"orderId1", "orderId2"}

func main() {
	client, err := dapr.NewClient()
	if err != nil {
		log.Panic(err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get config items from config store
	for _, key := range CONFIGURATION_KEYS {
		config, err := client.GetConfigurationItem(ctx, DAPR_CONFIGURATION_STORE, key)
		if err != nil {
			fmt.Printf("Could not get config item, err:" + err.Error())
			os.Exit(1)
		}
		c, _ := json.Marshal(config)
		fmt.Println("Configuration for " + key + ": " + string(c))
	}

	// Subscribe for config changes
	subscriptionID, err := client.SubscribeConfigurationItems(ctx, DAPR_CONFIGURATION_STORE, CONFIGURATION_KEYS, func(id string, items map[string]*dapr.ConfigurationItem) {
		// Print config changes
		for k, v := range items {
			fmt.Printf("get updated config key = %s, value = %s \n", k, v.Value)
		}
	})
	if err != nil {
		fmt.Println("Error subscribing to config updates, err:" + err.Error())
		os.Exit(1)
	}
	fmt.Println("App subscribed to config changes with subscription id: " + subscriptionID)

<-ctx.Done()

	os.Exit(0)
}
