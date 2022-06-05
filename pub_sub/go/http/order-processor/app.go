package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

type JSONObj struct {
	PubsubName string `json:"pubsubName"`
	Topic      string `json:"topic"`
	Route      string `json:"route"`
}

type Result struct {
	Data string `json:"data"`
}

func getOrder(w http.ResponseWriter, r *http.Request) {
	jsonData := []JSONObj{
		{
			PubsubName: "orderpubsub",
			Topic:      "orders",
			Route:      "orders",
		},
	}
	jsonBytes, err := json.Marshal(jsonData)
	if err != nil {
		log.Fatal("Error in reading the result obj")
	}
	_, err = w.Write(jsonBytes)
	if err != nil {
		log.Fatal("Error in writing the result obj")
	}
}

func postOrder(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Fatal(err)
	}
	var result Result
	err = json.Unmarshal(data, &result)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Subscriber received: ", string(result.Data))
	obj, err := json.Marshal(data)
	if err != nil {
		log.Fatal("Error in reading the result obj")
	}
	_, err = w.Write(obj)
	if err != nil {
		log.Fatal("Error in writing the result obj")
	}
}

func main() {
	appPort := "6002"
	if value, ok := os.LookupEnv("APP_PORT"); ok {
		appPort = value
	}

	r := mux.NewRouter()

	r.HandleFunc("/dapr/subscribe", getOrder).Methods("GET")

	// Dapr subscription routes orders topic to this route
	r.HandleFunc("/orders", postOrder).Methods("POST")

	if err := http.ListenAndServe(":"+appPort, r); err != nil {
		log.Panic(err)
	}
}
