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
var CONFIGURATION_ITEMS = []string{"orderId1", "orderId2"}

func main() {
	client, err := dapr.NewClient()
	if err != nil {
		log.Panic(err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	// Get config items from config store
	for _, item := range CONFIGURATION_ITEMS {
		config, err := client.GetConfigurationItem(ctx, DAPR_CONFIGURATION_STORE, item)
		if err != nil {
			fmt.Printf("Could not get config item, err:" + err.Error())
			os.Exit(1)
		}
		c, _ := json.Marshal(config)
		fmt.Println("Configuration for " + item + ": " + string(c))
	}

	var subscriptionId string

	// Subscribe for config changes
	err = client.SubscribeConfigurationItems(ctx, DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS, func(id string, config map[string]*dapr.ConfigurationItem) {
		// First invocation when app subscribes to config changes only returns subscription id
		if len(config) == 0 {
			fmt.Println("App subscribed to config changes with subscription id: " + id)
			subscriptionId = id
			return
		}
		// Print config changes
		c, _ := json.Marshal(config)
		fmt.Println("Configuration update " + string(c))
	})
	if err != nil {
		fmt.Println("Error subscribing to config updates, err:" + err.Error())
		os.Exit(1)
	}

	// Unsubscribe to config updates and exit app after 20 seconds
	select {
	case <-ctx.Done():
		err = client.UnsubscribeConfigurationItems(context.Background(), DAPR_CONFIGURATION_STORE, subscriptionId)
		if err != nil {
			fmt.Println("Error unsubscribing to config updates, err:" + err.Error())
		} else {
			fmt.Println("App unsubscribed to config changes")
		}
		os.Exit(0)
	default:
	}
}
