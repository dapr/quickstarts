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
		log.Println("Error reading body:", err.Error())
	}
	fmt.Println("Order received:", string(data))
	_, err = w.Write(data)
	if err != nil {
		log.Println("Error writing the response:", err.Error())
	}
}

func main() {
	// Create a new router and respond to POST /orders requests
	r := mux.NewRouter()
	r.HandleFunc("/orders", getOrder).Methods("POST")

	// Start the server listening on port 6001
	// This is a blocking call
	err := http.ListenAndServe(":6001", r)
	if err != http.ErrServerClosed {
		log.Println("Error starting HTTP server")
	}
}
