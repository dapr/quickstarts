package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func getCheckout(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	orderId := vars["orderId"]
	log.Println("Checked out order id : " + orderId)
	obj, err := json.Marshal("CID" + orderId)
	if err != nil {
		log.Println("Error in reading the result obj")
	}
	w.Write(obj)
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/checkout/{orderId}", getCheckout).Methods("GET")
	http.ListenAndServe(":6002", r)
}
