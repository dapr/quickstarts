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
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/invopop/jsonschema"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/durationpb"
	"google.golang.org/protobuf/types/known/structpb"

	dapr "github.com/dapr/go-sdk/client"
)

// getWeatherInLocation is an example function to use as a tool call
func getWeatherInLocation(request GetDegreesWeatherRequest, defaultValues GetDegreesWeatherRequest) string {
	location := request.Location
	unit := request.Unit
	if location == "location" {
		location = defaultValues.Location
	}
	if unit == "unit" {
		unit = defaultValues.Unit
	}
	return fmt.Sprintf("The weather in %s is 25 degrees %s", location, unit)
}

type GetDegreesWeatherRequest struct {
	Location string `json:"location" jsonschema:"title=Location,description=The location to look up the weather for"`
	Unit     string `json:"unit" jsonschema:"enum=celsius,enum=fahrenheit,description=Unit"`
}

// GenerateFunctionTool helper method to create jsonschema input
func GenerateFunctionTool[T any](name, description string) (*dapr.ConversationToolsAlpha2, error) {
	reflector := jsonschema.Reflector{
		AllowAdditionalProperties: false,
		DoNotReference:            true,
	}
	var v T

	schema := reflector.Reflect(v)

	schemaBytes, err := schema.MarshalJSON()
	if err != nil {
		return nil, err
	}

	var protoStruct structpb.Struct
	if err := protojson.Unmarshal(schemaBytes, &protoStruct); err != nil {
		return nil, fmt.Errorf("converting jsonschema to proto Struct: %w", err)
	}

	return (*dapr.ConversationToolsAlpha2)(&dapr.ConversationToolsFunctionAlpha2{
		Name:        name,
		Description: &description,
		Parameters:  &protoStruct,
	}), nil
}

// createUserMessageInput is a helper method to create user messages in expected proto format
func createUserMessageInput(msg string) *dapr.ConversationInputAlpha2 {
	return &dapr.ConversationInputAlpha2{
		Messages: []*dapr.ConversationMessageAlpha2{
			{
				ConversationMessageOfUser: &dapr.ConversationMessageOfUserAlpha2{
					Content: []*dapr.ConversationMessageContentAlpha2{
						{
							Text: &msg,
						},
					},
				},
			},
		},
	}
}

func main() {
	client, err := dapr.NewClient()
	if err != nil {
		panic(err)
	}

	inputMsg := "What is dapr?"
	conversationComponent := "ollama"

	// Optional: structured outputs and prompt cache retention
	responseFormat, err := structpb.NewStruct(map[string]any{
		"type": "object",
		"properties": map[string]any{
			"answer": map[string]any{"type": "string"},
		},
		"required": []any{"answer"},
	})
	if err != nil {
		log.Fatalf("failed to build response_format: %v", err)
	}

	request := dapr.ConversationRequestAlpha2{
		Name:                 conversationComponent,
		Inputs:               []*dapr.ConversationInputAlpha2{createUserMessageInput(inputMsg)},
		ResponseFormat:       responseFormat,
		PromptCacheRetention: durationpb.New(24 * time.Hour),
	}

	fmt.Println("Input sent:", inputMsg)

	resp, err := client.ConverseAlpha2(context.Background(), request)
	if err != nil {
		log.Fatalf("err: %v", err)
	}

	firstOut := resp.Outputs[0]
	if firstOut.Model != nil && *firstOut.Model != "" {
		fmt.Println("Model:", *firstOut.Model)
	}
	if firstOut.Usage != nil {
		fmt.Printf("Usage: prompt_tokens=%d completion_tokens=%d total_tokens=%d\n",
			firstOut.Usage.PromptTokens, firstOut.Usage.CompletionTokens, firstOut.Usage.TotalTokens)
	}
	fmt.Println("Output response:", firstOut.Choices[0].Message.Content)

	tool, err := GenerateFunctionTool[GetDegreesWeatherRequest]("getWeather", "get weather from a location in the given unit")
	if err != nil {
		log.Fatalf("err: %v", err)
	}

	weatherMessage := "What is the weather like in San Francisco in celsius?"
	fmt.Println("Tool calling input sent:", weatherMessage)
	requestWithTool := dapr.ConversationRequestAlpha2{
		Name:   conversationComponent,
		Inputs: []*dapr.ConversationInputAlpha2{createUserMessageInput(weatherMessage)},
		Tools:  []*dapr.ConversationToolsAlpha2{tool},
	}

	resp, err = client.ConverseAlpha2(context.Background(), requestWithTool)
	if err != nil {
		log.Fatalf("err: %v", err)
	}

	toolOut := resp.Outputs[0]
	if toolOut.Model != nil && *toolOut.Model != "" {
		fmt.Println("Model:", *toolOut.Model)
	}
	if toolOut.Usage != nil {
		fmt.Printf("Usage: prompt_tokens=%d completion_tokens=%d total_tokens=%d\n",
			toolOut.Usage.PromptTokens, toolOut.Usage.CompletionTokens, toolOut.Usage.TotalTokens)
	}

	fmt.Println(toolOut.Choices[0].Message.Content)
	for _, toolCalls := range toolOut.Choices[0].Message.ToolCalls {
		fmt.Printf("Tool Call: Name: %s - Arguments: %v\n", toolCalls.ToolTypes.Name, toolCalls.ToolTypes.Arguments)

		// parse the arguments and execute tool
		args := []byte(toolCalls.ToolTypes.Arguments)

		// find the tool (only one in this case) and execute
		for _, toolInfo := range requestWithTool.Tools {
			if toolInfo.Name == toolCalls.ToolTypes.Name && toolInfo.Name == "getWeather" {
				var reqArgs GetDegreesWeatherRequest
				if err = json.Unmarshal(args, &reqArgs); err != nil {
					log.Fatalf("err: %v", err)
				}
				// execute tool
				toolExecutionOutput := getWeatherInLocation(reqArgs, GetDegreesWeatherRequest{Location: "San Francisco", Unit: "Celsius"})
				fmt.Printf("Tool Call Output: %s\n", toolExecutionOutput)
			}
		}
	}
}
