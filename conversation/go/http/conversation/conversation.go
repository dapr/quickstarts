/*
Copyright 2024 The Dapr Authors
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

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

const conversationComponentName = "echo"

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

	var inputBody = `{
		"name": "echo",
		"inputs": [{"content":"What is dapr?"}],
		"parameters": {},
		"metadata": {}
    }`

	reqURL := daprHost + ":" + daprHttpPort + "/v1.0-alpha1/conversation/" + conversationComponentName + "/converse"

	req, err := http.NewRequest("POST", reqURL, strings.NewReader(inputBody))
	if err != nil {
		log.Fatal(err.Error())
	}

	req.Header.Set("Content-Type", "application/json")

	// Send a request to the echo LLM component
	res, err := client.Do(req)
	if err != nil {
		log.Fatal(err)
	}

	defer res.Body.Close()

	fmt.Println("Input sent: What is dapr?")

	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		log.Fatal(err)
	}

	// Unmarshal the response
	var data map[string][]map[string]string
	if err := json.Unmarshal(bodyBytes, &data); err != nil {
		log.Fatal(err)
	}

	result := data["outputs"][0]["result"]
	fmt.Println("Output response:", result)

}
