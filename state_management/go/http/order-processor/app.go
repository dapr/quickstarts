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

const stateStoreComponentName = "statestore"

func main() {
	daprHost := os.Getenv("DAPR_HOST")
	if daprHost == "" {
		daprHost = "http://localhost"
	}
	daprHttpPort := os.Getenv("DAPR_HTTP_PORT")
	if daprHttpPort == "" {
		daprHttpPort = "3500"
	}

	client := http.Client{
		Timeout: 15 * time.Second,
	}

	for i := 1; i <= 100; i++ {
		orderId := i
		order := `{"orderId":` + strconv.Itoa(orderId) + "}"
		state, _ := json.Marshal([]map[string]string{
			{
				"key":   strconv.Itoa(orderId),
				"value": order,
			},
		})

		// Save state into a state store
		res, err := client.Post(daprHost+":"+daprHttpPort+"/v1.0/state/"+stateStoreComponentName, "application/json", bytes.NewReader(state))
		if err != nil {
			panic(err)
		}
		res.Body.Close()
		fmt.Println("Saved Order:", order)

		// Get state from a state store
		getResponse, err := client.Get(daprHost + ":" + daprHttpPort + "/v1.0/state/" + stateStoreComponentName + "/" + strconv.Itoa(orderId))
		if err != nil {
			panic(err)
		}
		result, err := ioutil.ReadAll(getResponse.Body)
		if err != nil {
			panic(err)
		}
		fmt.Println("Retrieved Order:", string(result))
		getResponse.Body.Close()

		// Delete state from the state store
		req, err := http.NewRequest(http.MethodDelete, daprHost+":"+daprHttpPort+"/v1.0/state/"+stateStoreComponentName+"/"+strconv.Itoa(orderId), nil)
		if err != nil {
			panic(err)
		}
		res, err = client.Do(req)
		if err != nil {
			panic(err)
		}
		res.Body.Close()
		log.Println("Deleted Order:", order)

		time.Sleep(5000)
	}
}
