package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"net/url"
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
	for true {
		orderId := rand.Intn(1000-1) + 1

		state := url.Values{
			"key":   {"orderId"},
			"value": {strconv.Itoa(orderId)},
		}

		postResponse, err := http.PostForm(DAPR_HOST+":"+DAPR_HTTP_PORT+"/v1.0/state/"+DAPR_STATE_STORE, state)
		if err != nil {
			fmt.Print(err.Error())
			os.Exit(1)
		}

		log.Println(postResponse)

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
		log.Println(result)
	}
}
