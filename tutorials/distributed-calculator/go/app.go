//
// Copyright 2021 The Dapr Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//     http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

type Operands struct {
	OperandOne float32 `json:"operandOne,string"`
	OperandTwo float32 `json:"operandTwo,string"`
}

func add(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	var operands Operands
	json.NewDecoder(r.Body).Decode(&operands)
	fmt.Printf("Adding %f to %f\n", operands.OperandOne, operands.OperandTwo)
	json.NewEncoder(w).Encode(operands.OperandOne + operands.OperandTwo)
}

func main() {
	appPort := "6000"
	if value, ok := os.LookupEnv("APP_PORT"); ok {
		appPort = value
	}
	router := mux.NewRouter()

	router.HandleFunc("/add", add).Methods("POST", "OPTIONS")
	log.Fatal(http.ListenAndServe(":"+appPort, router))
}
