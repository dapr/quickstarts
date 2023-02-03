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

/*
dapr run --app-id batch-sdk --app-port 6002 --dapr-http-port 3502 --dapr-grpc-port 60002 --resources-path ../../../components -- go run .
*/

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"

	dapr "github.com/dapr/go-sdk/client"
	"github.com/gorilla/mux"
)

var (
	cronBindingName, sqlBindingName string = "cron", "sqldb"
)

type Orders struct {
	Orders []Order `json:"orders"`
}

type Order struct {
	OrderId  int     `json:"orderid"`
	Customer string  `json:"customer"`
	Price    float64 `json:"price"`
}

func processBatch(w http.ResponseWriter, r *http.Request) {

	fmt.Println("Processing batch...")

	fileContent, err := os.Open("../../../orders.json")
	if err != nil {
		log.Fatal(err)
		return
	}

	defer fileContent.Close()

	byteResult, _ := ioutil.ReadAll(fileContent)

	var orders Orders

	json.Unmarshal(byteResult, &orders)

	for i := 0; i < len(orders.Orders); i++ {
		err := sqlOutput(orders.Orders[i])
		if err != nil {
			log.Fatal(err)
			os.Exit(1)
		}
	}
	fmt.Println("Finished processing batch")

}

func sqlOutput(order Order) (err error) {

	client, err := dapr.NewClient()
	if err != nil {
		return err
	}

	ctx := context.Background()

	sqlCmd := fmt.Sprintf("insert into orders (orderid, customer, price) values (%d, '%s', %s);", order.OrderId, order.Customer, strconv.FormatFloat(order.Price, 'f', 2, 64))
	fmt.Println(sqlCmd)

	// Insert order using Dapr output binding via Dapr SDK
	in := &dapr.InvokeBindingRequest{
		Name:      sqlBindingName,
		Operation: "exec",
		Data:      []byte(""),
		Metadata:  map[string]string{"sql": sqlCmd},
	}
	err = client.InvokeOutputBinding(ctx, in)
	if err != nil {
		return err
	}

	return nil
}

func main() {
	var appPort string
	var okHost bool
	if appPort, okHost = os.LookupEnv("APP_PORT"); !okHost {
		appPort = "6002"
	}

	r := mux.NewRouter()

	// Triggered by Dapr input binding
	r.HandleFunc("/"+cronBindingName, processBatch).Methods("POST")

	if err := http.ListenAndServe(":"+appPort, r); err != nil {
		log.Panic(err)
	}
}
