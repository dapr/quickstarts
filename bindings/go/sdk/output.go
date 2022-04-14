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

// dapr run --app-id go-output-binding-sdk --app-port 3500 --components-path ../../components go run output.go

import (
	"context"
	"fmt"
	"strconv"
	"time"

	dapr "github.com/dapr/go-sdk/client"
)

//code
func main() {
	bindingName := "sample-topic"
	bindingOperation := "create"
	for i := 1; i <= 10; i++ {
		time.Sleep(5000)
		order := `{"OrderId":` + strconv.Itoa(i) + `}`
		client, err := dapr.NewClient()
		if err != nil {
			panic(err)
		}
		defer client.Close()
		ctx := context.Background()
		//Using Dapr SDK to invoke output binding
		in := &dapr.InvokeBindingRequest{Name: bindingName, Operation: bindingOperation, Data: []byte(order)}
		err = client.InvokeOutputBinding(ctx, in)
		fmt.Println("Golang - Kafka SDK output binding: ", order)
	}
}
