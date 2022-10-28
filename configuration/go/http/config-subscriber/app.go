package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gorilla/mux"
)

var DAPR_HOST, DAPR_HTTP_PORT string
var okHost, okPort bool
var appPort = "6001"
var DAPR_CONFIGURATION_STORE = "configstore"
var CONFIGURATION_ITEMS = []string{"appID1", "appID2"}

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

	// Create POST endpoint to receive config updates
	go startServerToListen()
	// Subscribe for config updates
	go subscribeToConfigUpdates()
	// Block main goroutine for 15 seconds and then stop the app
	time.Sleep(15 * time.Second)
}

func subscribeToConfigUpdates() {
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
		return
	} else {
		fmt.Println("Error subscribing to config updates: ", string(sub))
		os.Exit(1)
	}
}

func startServerToListen() {
	r := mux.NewRouter()
	r.HandleFunc("/configuration/configstore/{configItem}", configUpdateHandler).Methods("POST")
	if err := http.ListenAndServe(":"+appPort, r); err != nil {
		log.Panic(err)
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
