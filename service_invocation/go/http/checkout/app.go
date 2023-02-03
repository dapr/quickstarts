package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

func main() {
	daprHost := os.Getenv("DAPR_HOST")
	if daprHost == "" {
		daprHost = "http://localhost"
	}
	daprHttpPort := os.Getenv("DAPR_HTTP_PORT")
	if daprHttpPort == "" {
		daprHttpPort = "3500"
	}
	client := &http.Client{
		Timeout: 15 * time.Second,
	}
	for i := 1; i <= 20; i++ {
		order := `{"orderId":` + strconv.Itoa(i) + "}"
		req, err := http.NewRequest("POST", daprHost+":"+daprHttpPort+"/orders", strings.NewReader(order))
		if err != nil {
			log.Fatal(err.Error())
		}

		// Adding app id as part of th header
		req.Header.Add("dapr-app-id", "order-processor")

		// Invoking a service
		response, err := client.Do(req)
		if err != nil {
			log.Fatal(err.Error())
		}

		// Read the response
		result, err := ioutil.ReadAll(response.Body)
		if err != nil {
			log.Fatal(err)
		}
		response.Body.Close()

		fmt.Println("Order passed:", string(result))
	}
}
