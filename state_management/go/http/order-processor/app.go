package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
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
	for i := 1; i <= 10; i++ {
		orderId := i
		order := "{\"orderId\":" + strconv.Itoa(orderId) + "}"
		state, _ := json.Marshal([]map[string]string{
			{"key": strconv.Itoa(orderId), "value": order},
		})
		responseBody := bytes.NewBuffer(state)

		// Save state into a state store
		_, _ = http.Post(DAPR_HOST+":"+DAPR_HTTP_PORT+"/v1.0/state/"+DAPR_STATE_STORE, "application/json", responseBody)
		log.Println("Saving Order: " + order)

		// Get state from a state store
		getResponse, err := http.Get(DAPR_HOST + ":" + DAPR_HTTP_PORT + "/v1.0/state/" + DAPR_STATE_STORE + "/" + strconv.Itoa(orderId))
		if err != nil {
			fmt.Print(err.Error())
			os.Exit(1)
		}
		result, _ := ioutil.ReadAll(getResponse.Body)
		fmt.Println("Getting Order: ", string(result))

		// Delete state from the state store
		req, _ := http.NewRequest(http.MethodDelete, DAPR_HOST+":"+DAPR_HTTP_PORT+"/v1.0/state/"+DAPR_STATE_STORE+"/"+strconv.Itoa(orderId), nil)
		client := &http.Client{}
		_, _ = client.Do(req)
		log.Println("Deleting Order: " + order)

		time.Sleep(5000)
	}
}
