package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	dapr "github.com/dapr/go-sdk/client"
	"github.com/gorilla/mux"
)

type Order struct {
	orderName string
	orderNum  string
}

func getProcessedOrder(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	orderId := vars["orderId"]
	client, err := dapr.NewClient()
	if err != nil {
		panic(err)
	}
	defer client.Close()
	ctx := context.Background()

	result, err := client.InvokeMethod(ctx, "checkoutservice", "checkout/"+orderId, "get")

	log.Println("Order requested: " + orderId)
	log.Println("Result")
	log.Println(result)
	obj, err := json.Marshal(Order{"order1", orderId})
	if err != nil {
		log.Println("Error in reading the result obj")
	}
	w.Write([]byte(obj))
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/order/{orderId}", getProcessedOrder).Methods("GET")
	http.ListenAndServe(":6001", r)
}
