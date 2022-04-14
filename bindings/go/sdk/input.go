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

// dapr run --app-id go-input-binding-sdk --app-port 6101 --components-path ../../components go run input.go
import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/dapr/go-sdk/service/common"
	daprd "github.com/dapr/go-sdk/service/http"
)

func main() {
	bindingName := "/sample-topic"
	daprPort := ":6101"
	s := daprd.NewService(daprPort)

	if err := s.AddBindingInvocationHandler(bindingName, runHandler); err != nil {
		log.Fatalf("error adding binding handler: %v", err)
	}

	if err := s.Start(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("error listenning: %v", err)
	}
}

func runHandler(ctx context.Context, in *common.BindingEvent) (out []byte, err error) {
	fmt.Println("Golang - Kafka SDK input binding: ", string(in.Data))
	return nil, nil
}
