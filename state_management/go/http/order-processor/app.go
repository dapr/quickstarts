package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"time"
)

func main() {
	var DAPR_HOST, DAPR_HTTP_PORT string
	var okHost, okPort bool
	if DAPR_HOST, okHost = os.LookupEnv("DAPR_HOST"); !okHost {
		DAPR_HOST = "http://localhost"
	}
	if DAPR_HTTP_PORT, okPort = os.LookupEnv("DAPR_HTTP_PORT"); !okPort {
		DAPR_HTTP_PORT = "3500"
	}

	DAPR_STATE_STORE := "statestore"
	for {
		orderId := rand.Intn(1000-1) + 1
		order := "{\"orderId\":" + strconv.Itoa(orderId) + "}"
		state, _ := json.Marshal([]map[string]string{
			{"key": strconv.Itoa(orderId), "value": order},
		})
		responseBody := bytes.NewBuffer(state)

		// Save state into a state store
		postResponse, _ := http.Post(DAPR_HOST+":"+DAPR_HTTP_PORT+"/v1.0/state/"+DAPR_STATE_STORE, "application/json", responseBody)
		log.Println("Saving Order: " + order)
		log.Println(postResponse)

		// Get state from a state store
		getResponse, err := http.Get(DAPR_HOST + ":" + DAPR_HTTP_PORT + "/v1.0/state/" + DAPR_STATE_STORE + "/" + strconv.Itoa(orderId))
		if err != nil {
			fmt.Print(err.Error())
			os.Exit(1)
		}
		result, err := ioutil.ReadAll(getResponse.Body)
		if err != nil {
			log.Fatal(err)
		}
		log.Println("Getting Order: " + order)
		log.Println(result)

		// Delete state from the state store
		req, err := http.NewRequest(http.MethodDelete, DAPR_HOST+":"+DAPR_HTTP_PORT+"/v1.0/state/"+DAPR_STATE_STORE+"/"+strconv.Itoa(orderId), nil)
		client := &http.Client{}
		deleteResponse, err := client.Do(req)
		if err != nil {
			log.Fatalln(err)
		}
		log.Println("Deleting Order: " + order)
		log.Println(deleteResponse)

		time.Sleep(5000)
	}
}
