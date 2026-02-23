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

const conversationComponentName = "ollama"

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
		Timeout: 60 * time.Second,
	}

	var inputBody = `{
		"name": "ollama",
		"inputs": [{
			"messages": [{
				"ofUser": {
					"content": [{
						"text": "What is dapr?"
					}]
				}
			}]
		}],
		"parameters": {},
		"metadata": {},
		"response_format": {
			"type": "object",
			"properties": {
				"answer": {"type": "string"}
			},
			"required": ["answer"]
		},
		"prompt_cache_retention": "86400s"
    }`

	reqURL := daprHost + ":" + daprHttpPort + "/v1.0-alpha2/conversation/" + conversationComponentName + "/converse"

	req, err := http.NewRequest("POST", reqURL, strings.NewReader(inputBody))
	if err != nil {
		log.Fatal(err.Error())
	}

	req.Header.Set("Content-Type", "application/json")

	// Send a request to the Ollama LLM component
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

	var data struct {
		Outputs []struct {
			Choices []struct {
				Message struct {
					Content string `json:"content"`
				} `json:"message"`
			} `json:"choices"`
			Model  string `json:"model"`
			Usage  any    `json:"usage"`
			Result string `json:"result"`
		} `json:"outputs"`
	}
	if err := json.Unmarshal(bodyBytes, &data); err != nil {
		log.Fatal(err)
	}

	if len(data.Outputs) == 0 {
		log.Fatal("no outputs in response")
	}
	out := data.Outputs[0]
	result := out.Result
	if len(out.Choices) > 0 {
		result = out.Choices[0].Message.Content
	}
	if out.Model != "" {
		fmt.Println("Model:", out.Model)
	}
	fmt.Println("Output response:", result)

	// Tool calling example
	var toolCallBody = `{
		"inputs": [{
			"messages": [{
				"ofUser": {
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
		"toolChoice": "required"
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
	outputs2, ok := data2["outputs"].([]any)
	if !ok || len(outputs2) == 0 {
		fmt.Println("No outputs in tool calling response")
		return
	}
	output2 := outputs2[0].(map[string]any)

	if model, ok := output2["model"].(string); ok && model != "" {
		fmt.Println("Model:", model)
	}
	if usage, ok := output2["usage"].(map[string]any); ok {
		fmt.Printf("Usage: prompt_tokens=%v completion_tokens=%v total_tokens=%v\n",
			usage["promptTokens"], usage["completionTokens"], usage["totalTokens"])
	}

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
