package main

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
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
	const PUBSUB_NAME = "order_pub_sub"
	const PUBSUB_TOPIC = "orders"
	for i := 1; i <= 10; i++ {
		order := "{\"orderId\":" + strconv.Itoa(i) + "}"
		client := &http.Client{}
		req, err := http.NewRequest("POST", DAPR_HOST+":"+DAPR_HTTP_PORT+"/v1.0/publish/"+PUBSUB_NAME+"/"+PUBSUB_TOPIC, strings.NewReader(order))
		if err != nil {
			fmt.Print(err.Error())
			os.Exit(1)
		}

		// Publish an event using Dapr pub/sub
		client.Do(req)

		if err != nil {
			fmt.Print(err.Error())
			os.Exit(1)
		}

		fmt.Println("Published data: ", string(order))

		time.Sleep(1000)
	}
}
