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

const PUBSUB_NAME = "order_pub_sub"
const PUBSUB_TOPIC = "orders"

func main() {
	DAPR_HOST := "http://localhost"
	if value, ok := os.LookupEnv("DAPR_HOST"); ok {
		DAPR_HOST = value
	}
	DAPR_HTTP_PORT := "3500"
	if value, ok := os.LookupEnv("DAPR_HTTP_PORT"); ok {
		DAPR_HTTP_PORT = value
	}
	for i := 1; i <= 10; i++ {
		order := `{"orderId":` + strconv.Itoa(i) + `}`
		client := http.Client{}
		req, err := http.NewRequest("POST", DAPR_HOST+":"+DAPR_HTTP_PORT+"/v1.0/publish/"+PUBSUB_NAME+"/"+PUBSUB_TOPIC, strings.NewReader(order))
		if err != nil {
			log.Fatal(err.Error())
			os.Exit(1)
		}

		// Publish an event using Dapr pub/sub
		if _, err = client.Do(req); err != nil {
			log.Fatal(err)
		}

		fmt.Println("Published data: ", string(order))

		time.Sleep(1000)
	}
}
