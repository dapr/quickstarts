package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

type JsonObj struct {
	PubsubName string
	Topic      string
	Route      string
}

func getOrder(w http.ResponseWriter, r *http.Request) {
	jsonData := []JsonObj{
		{
			PubsubName: "order_pub_sub",
			Topic:      "orders",
			Route:      "orders",
		},
	}
	obj, err := json.Marshal(jsonData)
	if err != nil {
		log.Println("Error in reading the result obj")
	}
	_, err = w.Write(obj)
	if err != nil {
		log.Println("Error in writing the result obj")
	}
}

func postOrder(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Subscriber received: %s", string(data))
	obj, err := json.Marshal(data)
	if err != nil {
		log.Println("Error in reading the result obj")
	}
	_, err = w.Write(obj)
	if err != nil {
		log.Println("Error in writing the result obj")
	}
}

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/dapr/subscribe", getOrder).Methods("GET")

	// Dapr subscription routes orders topic to this route
	r.HandleFunc("/orders", postOrder).Methods("POST")

	_ = http.ListenAndServe(":6001", r)
}
