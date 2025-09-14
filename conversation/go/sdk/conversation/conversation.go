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
	"fmt"
	"log"

	"github.com/invopop/jsonschema"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/structpb"

	dapr "github.com/dapr/go-sdk/client"
)

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

// getWeather get weather from a location in the given unit
func get25DegreesWeather(req GetDegreesWeatherRequest) string {
	return fmt.Sprintf("The Weather in %s is 25 degrees %s", req.Location, req.Unit)
}

func main() {
	client, err := dapr.NewClientWithPort("56178")
	if err != nil {
		panic(err)
	}

	inputMsg := "What is dapr?"
	conversationComponent := "echo"

	request := dapr.ConversationRequestAlpha2{
		Name: conversationComponent,
		Inputs: []*dapr.ConversationInputAlpha2{
			{
				Messages: []*dapr.ConversationMessageAlpha2{
					{
						ConversationMessageOfUser: &dapr.ConversationMessageOfUserAlpha2{
							Content: []*dapr.ConversationMessageContentAlpha2{
								{
									Text: &inputMsg,
								},
							},
						},
					},
				},
			},
		},
	}

	fmt.Println("Input sent:", inputMsg)

	resp, err := client.ConverseAlpha2(context.Background(), request)
	if err != nil {
		log.Fatalf("err: %v", err)
	}

	fmt.Println("Output response:", resp.Outputs[0].Choices[0].Message.Content)

	tool, err := GenerateFunctionTool[GetDegreesWeatherRequest]("getWeather", "get weather from a location in the given unit")
	if err != nil {
		log.Fatalf("err: %v", err)
	}

	weatherMessage := "get weather in San Francisco in celsius"
	requestWithTool := dapr.ConversationRequestAlpha2{
		Name: conversationComponent,
		Inputs: []*dapr.ConversationInputAlpha2{
			{
				Messages: []*dapr.ConversationMessageAlpha2{
					{
						ConversationMessageOfUser: &dapr.ConversationMessageOfUserAlpha2{
							Content: []*dapr.ConversationMessageContentAlpha2{
								{
									Text: &weatherMessage,
								},
							},
						},
					},
				},
			},
		},
		Tools: []*dapr.ConversationToolsAlpha2{tool},
	}

	resp, err = client.ConverseAlpha2(context.Background(), requestWithTool)
	if err != nil {
		log.Fatalf("err: %v", err)
	}

	fmt.Println("Output response:", resp.Outputs[0].Choices[0].Message.Content)
	for _, toolCalls := range resp.Outputs[0].Choices[0].Message.ToolCalls {
		fmt.Printf("Tool Call - Name: %s - Arguments: %v\n", toolCalls.ToolTypes.Name, toolCalls.ToolTypes.Arguments)
	}
}
