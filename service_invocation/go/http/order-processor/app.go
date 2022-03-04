package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func getOrder(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Order received : %s", string(data))
	obj, err := json.Marshal(string(data))
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
	r.HandleFunc("/orders", getOrder).Methods("POST")
	_ = http.ListenAndServe(":6001", r)
}
