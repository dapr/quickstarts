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
	"strings"

	"github.com/invopop/jsonschema"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/structpb"

	dapr "github.com/dapr/go-sdk/client"
)

// createMapOfArgsForEcho is a helper to deal with an issue with current echo provider not returning args as a map but a csv
func createMapOfArgsForEcho(s string) ([]byte, error) {
	m := map[string]any{}
	for _, p := range strings.Split(s, ",") {
		m[p] = p
	}
	return json.Marshal(m)
}

// getWeatherInLocation is an example function to use as tool
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
	conversationComponent := "echo"

	request := dapr.ConversationRequestAlpha2{
		Name:   conversationComponent,
		Inputs: []*dapr.ConversationInputAlpha2{createUserMessageInput(inputMsg)},
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
		Name:   conversationComponent,
		Inputs: []*dapr.ConversationInputAlpha2{createUserMessageInput(weatherMessage)},
		Tools:  []*dapr.ConversationToolsAlpha2{tool},
	}

	resp, err = client.ConverseAlpha2(context.Background(), requestWithTool)
	if err != nil {
		log.Fatalf("err: %v", err)
	}

	fmt.Println("Output response:", resp.Outputs[0].Choices[0].Message.Content)
	for _, toolCalls := range resp.Outputs[0].Choices[0].Message.ToolCalls {
		fmt.Printf("Tool Call - Name: %s - Arguments: %v\n", toolCalls.ToolTypes.Name, toolCalls.ToolTypes.Arguments)

		// parse the arguments and execute tool
		args := []byte(toolCalls.ToolTypes.Arguments)
		if conversationComponent == "echo" {
			// echo does not return a compliant tools argument, it should return json object with keys being the argument names
			args, err = createMapOfArgsForEcho(toolCalls.ToolTypes.Arguments)
			if err != nil {
				log.Fatalf("err: %v", err)
			}
		}

		// find the tool (only one in this case) and execute
		for _, toolInfo := range requestWithTool.Tools {
			if toolInfo.Name == toolCalls.ToolTypes.Name && toolInfo.Name == "getWeather" {
				var reqArgs GetDegreesWeatherRequest
				if err = json.Unmarshal(args, &reqArgs); err != nil {
					log.Fatalf("err: %v", err)
				}
				// execute tool
				toolExecutionOutput := getWeatherInLocation(reqArgs, GetDegreesWeatherRequest{Location: "San Francisco", Unit: "Celsius"})
				fmt.Printf("Tool Execution Output: %s\n", toolExecutionOutput)
			}
		}
	}
}
