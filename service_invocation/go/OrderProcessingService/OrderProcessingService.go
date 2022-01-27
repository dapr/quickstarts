package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strconv"

	"github.com/gorilla/mux"
)

func getOrder(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	orderId := rand.Intn(1000-1) + 1
	daprPort := "3602"
	daprUrl := "http://localhost:" + daprPort + "/v1.0/invoke/checkout/method/checkout/" + strconv.Itoa(orderId)
	response, err := http.Get(daprUrl)

	if err != nil {
		fmt.Print(err.Error())
		os.Exit(1)
	}

	result, err := ioutil.ReadAll(response.Body)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Order requested: " + strconv.Itoa(orderId))
	log.Println("Result: ")
	log.Println(result)
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/order", getOrder).Methods("GET")
	http.ListenAndServe(":6001", r)
}
