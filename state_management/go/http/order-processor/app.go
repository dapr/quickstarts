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
)

func main() {
	DAPR_HOST := "http://localhost"
	_, okHost := os.LookupEnv("DAPR_HOST")
	if okHost {
		DAPR_HOST = os.Getenv("DAPR_HOST")
	}
	DAPR_HTTP_PORT := "3500"
	_, okPort := os.LookupEnv("DAPR_HTTP_PORT")
	if okPort {
		DAPR_HTTP_PORT = os.Getenv("DAPR_HTTP_PORT")
	}
	DAPR_STATE_STORE := "statestore"
	for {
		orderId := rand.Intn(1000-1) + 1
		state, _ := json.Marshal([]map[string]string{
			{"key": "orderId", "value": strconv.Itoa(orderId)},
		})
		responseBody := bytes.NewBuffer(state)
		// Save state into a state store
		postResponse, _ := http.Post(DAPR_HOST+":"+DAPR_HTTP_PORT+"/v1.0/state/"+DAPR_STATE_STORE, "application/json", responseBody)
		log.Println(postResponse)
		// Get state from a state store
		getResponse, err := http.Get(DAPR_HOST + ":" + DAPR_HTTP_PORT + "/v1.0/state/" + DAPR_STATE_STORE + "/orderId")
		if err != nil {
			fmt.Print(err.Error())
			os.Exit(1)
		}
		result, err := ioutil.ReadAll(getResponse.Body)
		if err != nil {
			log.Fatal(err)
		}
		log.Println("Order requested: " + strconv.Itoa(orderId))
		log.Println("Result: ")
		log.Println(string(result))
	}
}
