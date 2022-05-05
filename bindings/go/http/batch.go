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
dapr run --app-id go-input-binding-http --app-port 6002 --dapr-http-port 6003 --dapr-grpc-port 60002 go run batch.go --components-path ../../components

docker run --name sql_db -p 5432:5432 -e POSTGRES_PASSWORD=admin -e POSTGRES_USER=admin -d postgres
docker exec -i -t sql_db psql --username admin  -p 5432 -h localhost --no-password
create database orders;
\c orders;
create table orders ( orderid int, customer text, price float ); select * from orders;
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

type Orders struct {
	Orders []Order `json:orders`
}

type Order struct {
	OrderId  int     `json:orderid`
	Customer string  `json:customer`
	Price    float64 `json:price`
}

func processCron(w http.ResponseWriter, r *http.Request) {

	fileContent, err := os.Open("../../orders.json")
	if err != nil {
		log.Fatal(err)
		return
	}

	fmt.Println("The File is opened successfully...")

	defer fileContent.Close()

	byteResult, _ := ioutil.ReadAll(fileContent)
	//	fmt.Println(string(byteResult))

	var orders Orders

	json.Unmarshal(byteResult, &orders)

	for i := 0; i < len(orders.Orders); i++ {
		err := sqlBindings(orders.Orders[i])
		if err != nil {
			log.Fatal(err)
			os.Exit(1)
		}
	}
	fmt.Println("Finished processing batch")
	os.Exit(0)
}

func sqlBindings(order Order) (err error) {

	daprHost := "http://localhost"
	if value, ok := os.LookupEnv("DAPR_HOST"); ok {
		daprHost = value
	}
	daprHttpPort := "6003"
	if value, ok := os.LookupEnv("DAPR_HTTP_PORT"); ok {
		daprHttpPort = value
	}
	bindingName := "SqlDB"

	sqlCmd := fmt.Sprintf("insert into orders (orderid, customer, price) values (%d, '%s', %s);", order.OrderId, order.Customer, strconv.FormatFloat(order.Price, 'f', 2, 64))

	orderCommand := `{  "operation": "exec",  "metadata" : { "sql" : "` + sqlCmd + `" } }`
	fmt.Println(orderCommand)

	client := http.Client{}
	req, err := http.NewRequest("POST", daprHost+":"+daprHttpPort+"/v1.0/bindings/"+bindingName, strings.NewReader(orderCommand))
	if err != nil {
		return err
	}
	if _, err = client.Do(req); err != nil {
		return err
	}
	return nil
}

func main() {
	daprPort := ":6002"
	bindingName := "/batch"
	r := mux.NewRouter()

	r.HandleFunc(bindingName, processCron).Methods("POST")
	// Dapr binding function

	if err := http.ListenAndServe(daprPort, r); err != nil {
		log.Panic(err)
	}
}
