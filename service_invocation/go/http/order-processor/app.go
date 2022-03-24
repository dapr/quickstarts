package main

import (
	"fmt"
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
	fmt.Println("Order received : ", string(data))
	_, err = w.Write(data)
	if err != nil {
		log.Println("Error in writing the result obj")
	}
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/orders", getOrder).Methods("POST")
	_ = http.ListenAndServe(":6001", r)
}
