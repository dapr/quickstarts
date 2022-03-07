package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
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
	for i := 1; i <= 10; i++ {
		order := "{\"orderId\":" + strconv.Itoa(i) + "}"
		client := &http.Client{}
		req, err := http.NewRequest("POST", DAPR_HOST+":"+DAPR_HTTP_PORT+"/orders", strings.NewReader(order))
		if err != nil {
			fmt.Print(err.Error())
			os.Exit(1)
		}
		// Adding app id as part of th header
		req.Header.Add("dapr-app-id", "order-processor")

		// Invoking a service
		response, err := client.Do(req)

		if err != nil {
			fmt.Print(err.Error())
			os.Exit(1)
		}

		result, err := ioutil.ReadAll(response.Body)
		if err != nil {
			log.Fatal(err)
		}

		fmt.Println("Order passed: ", string(result))
	}
}
