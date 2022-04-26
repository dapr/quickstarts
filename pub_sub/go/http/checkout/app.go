package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

const PUBSUB_NAME = "orderpubsub"
const PUBSUB_TOPIC = "orders"

func main() {
	daprHost := "http://localhost"
	if value, ok := os.LookupEnv("DAPR_HOST"); ok {
		daprHost = value
	}
	daprHttpPost := "3500"
	if value, ok := os.LookupEnv("DAPR_HTTP_PORT"); ok {
		daprHttpPost = value
	}
	for i := 1; i <= 10; i++ {
		order := `{"orderId":` + strconv.Itoa(i) + `}`
		client := http.Client{}
		req, err := http.NewRequest("POST", daprHost+":"+daprHttpPost+"/v1.0/publish/"+PUBSUB_NAME+"/"+PUBSUB_TOPIC, strings.NewReader(order))
		if err != nil {
			log.Fatal(err.Error())
			os.Exit(1)
		}

		// Publish an event using Dapr pub/sub
		if _, err = client.Do(req); err != nil {
			log.Fatal(err)
		}

		fmt.Println("Published data: ", order)

		time.Sleep(1000)
	}
}
