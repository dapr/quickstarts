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
dapr run --app-id batch-http --app-port 6003 --dapr-http-port 3503 --dapr-grpc-port 60003 --resources-path ../../../components -- go run .
*/

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

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

	fmt.Println("Processing batch..")

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
	var daprHost, daprHttpPort string
	var okHost, okPort bool

	if daprHost, okHost = os.LookupEnv("DAPR_HOST"); !okHost {
		daprHost = "http://localhost"
	}

	if daprHttpPort, okPort = os.LookupEnv("DAPR_HTTP_PORT"); !okPort {
		daprHttpPort = "3503"
	}

	var daprUrl string = daprHost + ":" + daprHttpPort + "/v1.0/bindings/" + sqlBindingName

	sqlCmd := fmt.Sprintf("insert into orders (orderid, customer, price) values (%d, '%s', %s);", order.OrderId, order.Customer, strconv.FormatFloat(order.Price, 'f', 2, 64))

	payload := `{"operation": "exec", "metadata": {"sql": "` + sqlCmd + `" }}`
	fmt.Println(sqlCmd)

	client := http.Client{}
	// Insert order using Dapr output binding via HTTP Post
	req, err := http.NewRequest("POST", daprUrl, strings.NewReader(payload))
	if err != nil {
		return err
	}
	if _, err = client.Do(req); err != nil {
		return err
	}
	return nil
}

func main() {
	var appPort string
	var okHost bool
	if appPort, okHost = os.LookupEnv("APP_PORT"); !okHost {
		appPort = "6003"
	}

	r := mux.NewRouter()

	// Triggered by Dapr input binding
	r.HandleFunc("/"+cronBindingName, processBatch).Methods("POST")

	if err := http.ListenAndServe(":"+appPort, r); err != nil {
		log.Panic(err)
	}
}
