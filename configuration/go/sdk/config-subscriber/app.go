package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	dapr "github.com/dapr/go-sdk/client"
)

func main() {
	client, err := dapr.NewClient()
	if err != nil {
		panic(err)
	}
	CONFIGURATION_STORE := "configstore"
	CONFIGURATION_ITEMS := []string{"appID1", "appID2"}
	ctx, cancel := context.WithTimeout(context.Background(), 15 * time.Second)
	defer cancel()

	// Get configuration from config store
	for _, item := range CONFIGURATION_ITEMS {
		config, err := client.GetConfigurationItem(ctx, CONFIGURATION_STORE, item)
		if err != nil {
			fmt.Printf("Error getting configuration for : %s", item)
		}
		c, _ := json.Marshal(config)
		fmt.Println("Configuration for " + item + ": " + string(c))
	}

	// Subscribe for config changes
	err = client.SubscribeConfigurationItems(ctx, CONFIGURATION_STORE, CONFIGURATION_ITEMS, func(id string, config map[string]*dapr.ConfigurationItem) {
		// First invocation when app subscribes to config changes only returns subscription id
		if len(config) == 0 {
			fmt.Println("App subscribed to config changes with subscription id: " + id)
			return
		}
		// Print config changes
		c, _ := json.Marshal(config)
		fmt.Println("Configuration update " + string(c))
	})
	if err != nil {
		fmt.Println("Error subscribing to config changes")
		panic(err)
	}

	// Exit app after 15 seconds
	select {
	case <-ctx.Done():
		os.Exit(0)
	default:
	}
}
