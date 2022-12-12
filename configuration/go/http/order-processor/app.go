package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/mux"
)

var DAPR_HOST, DAPR_HTTP_PORT string
var okHost, okPort bool
var appPort = "6001"
var DAPR_CONFIGURATION_STORE = "configstore"
var CONFIGURATION_ITEMS = []string{"orderId1", "orderId2"}

func main() {
	if DAPR_HOST, okHost = os.LookupEnv("DAPR_HOST"); !okHost {
		DAPR_HOST = "http://localhost"
	}
	if DAPR_HTTP_PORT, okPort = os.LookupEnv("DAPR_HTTP_PORT"); !okPort {
		DAPR_HTTP_PORT = "3500"
	}
	if value, ok := os.LookupEnv("APP_PORT"); ok {
		appPort = value
	}

	// Get config items from the config store
	for _, item := range CONFIGURATION_ITEMS {
		getResponse, err := http.Get(DAPR_HOST + ":" + DAPR_HTTP_PORT + "/v1.0-alpha1/configuration/" + DAPR_CONFIGURATION_STORE + "?key=" + item)
		if err != nil {
			fmt.Print("Could not get config item, err:" + err.Error())
			os.Exit(1)
		}
		result, _ := ioutil.ReadAll(getResponse.Body)
		fmt.Println("Configuration for "+item+":", string(result))
	}

	var subscriptionId string

	wg := new(sync.WaitGroup)
	wg.Add(2)
	// Start HTTP Server to receive config updates for 20 seconds and then shutdown and unsubscribe from config updates
	go func() {
		startServerToListen(&subscriptionId)
		wg.Done()
	}()
	// Subscribe for config updates
	go func() {
		subscribeToConfigUpdates(&subscriptionId)
		wg.Done()
	}()
	wg.Wait()
}

func subscribeToConfigUpdates(subscriptionId *string) {
	// Add delay to allow app channel to be ready
	time.Sleep(3 * time.Second)

	subscription, err := http.Get(DAPR_HOST + ":" + DAPR_HTTP_PORT + "/v1.0-alpha1/configuration/" + DAPR_CONFIGURATION_STORE + "/subscribe")
	if err != nil {
		fmt.Println("Error subscribing to config updates, err:" + err.Error())
		os.Exit(1)
	}
	sub, err := ioutil.ReadAll(subscription.Body)
	if err != nil {
		fmt.Print("Unable to read subscription id, err: " + err.Error())
		os.Exit(1)
	}
	if !strings.Contains(string(sub), "errorCode") {
		var subid map[string]interface{}
		json.Unmarshal(sub, &subid)
		fmt.Println("App subscribed to config changes with subscription id:", subid["id"])
		*subscriptionId = subid["id"].(string)
	} else {
		fmt.Println("Error subscribing to config updates: ", string(sub))
		os.Exit(1)
	}
}

func startServerToListen(subscriptionId *string) {
	r := mux.NewRouter()
	httpServer := http.Server{
		Addr:    ":" + appPort,
		Handler: r,
	}
	r.HandleFunc("/configuration/configstore/{configItem}", configUpdateHandler).Methods("POST")

	// Unsubscribe to config updates and shutdown http server after 20 seconds
	time.AfterFunc(20*time.Second, func() {
		unsubscribeFromConfigUpdates(*subscriptionId)
		fmt.Println("Shutting down HTTP server")
		err := httpServer.Shutdown(context.Background())
		if err != nil {
			fmt.Println("Error shutting down HTTP server, err:" + err.Error())
		}
	})

	// Start HTTP server
	if err := httpServer.ListenAndServe(); err != nil {
		log.Println("HTTP server error:", err)
	}
}

func unsubscribeFromConfigUpdates(subscriptionId string) {
	unsubscribe, err := http.Get(DAPR_HOST + ":" + DAPR_HTTP_PORT + "/v1.0-alpha1/configuration/" + DAPR_CONFIGURATION_STORE + "/" + subscriptionId + "/unsubscribe")
	if err != nil {
		fmt.Println("Error unsubscribing from config updates, err:" + err.Error())
	}
	unsub, err := ioutil.ReadAll(unsubscribe.Body)
	if err != nil {
		fmt.Print("Unable to read unsubscribe response, err: " + err.Error())
	}
	if strings.Contains(string(unsub), "true") {
		fmt.Println("App unsubscribed from config changes")
		return
	} else {
		fmt.Println("Error unsubscribing from config updates: ", string(unsub))
	}
}

func configUpdateHandler(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Panic(err)
	}
	var notification map[string]interface{}
	json.Unmarshal(body, &notification)
	update, _ := json.Marshal(notification["items"])
	fmt.Println("Configuration update", string(update))
}
