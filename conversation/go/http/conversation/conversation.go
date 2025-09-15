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
		"inputs": [{
			"messages": [{
				"of_user": {
					"content": [{
						"text": "What is dapr?"
					}]
				}
			}]
		}],
		"parameters": {},
		"metadata": {}
	}`

	reqURL := daprHost + ":" + daprHttpPort + "/v1.0-alpha2/conversation/" + conversationComponentName + "/converse"

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
	var data map[string]any
	if err := json.Unmarshal(bodyBytes, &data); err != nil {
		log.Fatal(err)
	}

	// Navigate the new response structure: outputs[0].choices[0].message.content
	outputs := data["outputs"].([]any)
	output := outputs[0].(map[string]any)
	choices := output["choices"].([]any)
	choice := choices[0].(map[string]any)
	message := choice["message"].(map[string]any)
	result := message["content"].(string)

	fmt.Println("Output response:", result)

	// Tool calling example
	var toolCallBody = `{
		"inputs": [{
			"messages": [{
				"of_user": {
					"content": [{
						"text": "What is the weather like in San Francisco in celsius?"
					}]
				}
			}]
		}],
		"parameters": {},
		"metadata": {},
		"tools": [{
			"function": {
				"name": "get_weather",
				"description": "Get the current weather for a location",
				"parameters": {
					"type": "object",
					"properties": {
						"location": {
							"type": "string",
							"description": "The city and state, e.g. San Francisco, CA"
						},
						"unit": {
							"type": "string",
							"enum": ["celsius", "fahrenheit"],
							"description": "The temperature unit to use"
						}
					},
					"required": ["location"]
				}
			}
		}],
		"toolChoice": "auto"
	}`

	req2, err := http.NewRequest("POST", reqURL, strings.NewReader(toolCallBody))
	if err != nil {
		log.Fatal(err.Error())
	}

	req2.Header.Set("Content-Type", "application/json")

	res2, err := client.Do(req2)
	if err != nil {
		log.Fatal(err)
	}

	defer res2.Body.Close()

	fmt.Println("\nTool calling input sent: What is the weather like in San Francisco in celsius?")

	bodyBytes2, err := io.ReadAll(res2.Body)
	if err != nil {
		log.Fatal(err)
	}

	var data2 map[string]any
	if err := json.Unmarshal(bodyBytes2, &data2); err != nil {
		log.Fatal(err)
	}

	// Parse tool calling response
	outputs2 := data2["outputs"].([]any)
	output2 := outputs2[0].(map[string]any)
	choices2 := output2["choices"].([]any)
	choice2 := choices2[0].(map[string]any)
	message2 := choice2["message"].(map[string]any)

	if content, ok := message2["content"].(string); ok && content != "" {
		fmt.Println("Output message:", content)
	}

	if toolCalls, ok := message2["toolCalls"].([]any); ok && len(toolCalls) > 0 {
		fmt.Println("Tool calls detected:")
		for _, tc := range toolCalls {
			fmt.Printf("Tool call: %v\n", tc)
		}
	} else {
		fmt.Println("No tool calls in response")
	}
}
