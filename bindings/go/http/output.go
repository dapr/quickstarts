/*
Copyright 2021 The Dapr Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main

// dapr run --app-id go-output-binding-http --app-port 3500 --dapr-http-port 6001 --dapr-grpc-port 60001 go run output.go --components-path ../../components

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

func main() {
	daprHost := "http://localhost"
	if value, ok := os.LookupEnv("DAPR_HOST"); ok {
		daprHost = value
	}
	daprHttpPort := "6061"
	if value, ok := os.LookupEnv("DAPR_HTTP_PORT"); ok {
		daprHttpPort = value
	}
	bindingName := "sample-topic"

	for i := 1; i <= 10; i++ {
		order := `{ "data" : {"OrderId":` + strconv.Itoa(i) + `}, "operation": "create" }`
		client := http.Client{}
		req, err := http.NewRequest("POST", daprHost+":"+daprHttpPort+"/v1.0/bindings/"+bindingName, strings.NewReader(order))
		if err != nil {
			log.Fatal(err.Error())
			os.Exit(1)
		}

		// Publish a Kafka event
		if _, err = client.Do(req); err != nil {
			log.Fatal(err)
		}

		fmt.Println("Golang - Kafka HTTP output binding: ", order)

		time.Sleep(1000)
	}
}
