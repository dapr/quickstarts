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

	dapr "github.com/dapr/go-sdk/client"
)

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
}
