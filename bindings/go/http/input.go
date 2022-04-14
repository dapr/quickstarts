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

// dapr run --app-id go-input-binding-http --app-port 6002 --dapr-http-port 6003 --dapr-grpc-port 60002 go run input.go --components-path ../../components

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func processBinding(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Golang - Kafka HTTP input binding: ", string(data))
}

func main() {
	daprPort := ":6002"
	bindingName := "/sample-topic"
	r := mux.NewRouter()

	// Dapr binding function
	r.HandleFunc(bindingName, processBinding).Methods("POST")

	if err := http.ListenAndServe(daprPort, r); err != nil {
		log.Panic(err)
	}
}
