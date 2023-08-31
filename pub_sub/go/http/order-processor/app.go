package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
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
	Data map[string]int `json:"data"`
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
		log.Fatal(err.Error())
	}
	_, err = w.Write(jsonBytes)
	if err != nil {
		log.Fatal(err.Error())
	}
}

func postOrder(w http.ResponseWriter, r *http.Request) {
	data, err := io.ReadAll(r.Body)
	if err != nil {
		log.Fatal(err)
	}
	var result Result
	err = json.Unmarshal(data, &result)
	if err != nil {
		log.Fatal(err.Error())
	}
	for k, v := range result.Data {
		d := fmt.Sprintf(`Subscriber received: {"%s":%d}`, k, v)
		fmt.Println(d)
	}
	obj, err := json.Marshal(data)
	if err != nil {
		log.Fatal(err.Error())
	}
	_, err = w.Write(obj)
	if err != nil {
		log.Fatal(err.Error())
	}
}

func main() {
	appPort := os.Getenv("APP_PORT")
	if appPort == "" {
		appPort = "6002"
	}

	r := mux.NewRouter()

	// Handle the /dapr/subscribe route which Dapr invokes to get the list of subscribed endpoints
	r.HandleFunc("/dapr/subscribe", getOrder).Methods("GET")

	// Dapr subscription routes orders topic to this route
	r.HandleFunc("/orders", postOrder).Methods("POST")

	// Start the server; this is a blocking call
	err := http.ListenAndServe(":"+appPort, r)
	if !errors.Is(err, http.ErrServerClosed) {
		log.Panic(err)
	}
}
