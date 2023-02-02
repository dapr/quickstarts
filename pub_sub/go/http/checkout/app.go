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

const pubsubComponentName = "orderpubsub"
const pubsubTopic = "orders"

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

	for i := 1; i <= 10; i++ {
		order := `{"orderId":` + strconv.Itoa(i) + `}`
		req, err := http.NewRequest("POST", daprHost+":"+daprHttpPort+"/v1.0/publish/"+pubsubComponentName+"/"+pubsubTopic, strings.NewReader(order))
		if err != nil {
			log.Fatal(err.Error())
		}

		// Publish an event using Dapr pub/sub
		res, err := client.Do(req)
		if err != nil {
			log.Fatal(err)
		}
		defer res.Body.Close()

		fmt.Println("Published data:", order)

		time.Sleep(1000)
	}
}
