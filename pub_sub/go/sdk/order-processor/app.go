package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/dapr/go-sdk/service/common"
	daprd "github.com/dapr/go-sdk/service/http"
)

var sub = &common.Subscription{
	PubsubName: "orderpubsub",
	Topic:      "orders",
	Route:      "orders",
}

func main() {
	// read app-port passed through 'dapr run' command line
	// Refer to https://docs.dapr.io/reference/cli/dapr-run/
	// for dapr flags and their corresponding environment variables
	appPort, isSet := os.LookupEnv("APP_PORT")
	if !isSet {
		log.Fatalf("--app-port is not set. Re-run dapr run with -p or --app-port.\nUsage: https://docs.dapr.io/getting-started/quickstarts/pubsub-quickstart/\n")
	}

	s := daprd.NewService(":" + appPort)
	http.HandleFunc("/orders", handleRequest)
	if err := s.AddTopicEventHandler(sub, eventHandler); err != nil {
		log.Fatalf("error adding topic subscription: %v", err)
	}
	if err := s.Start(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("error listenning: %v", err)
	}
}

func eventHandler(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
	fmt.Println("Subscriber received: ", e.Data)
	return false, nil
}

func handleRequest(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(200)
	w.Header().Set("Content-Type", "application/json")
	resp := map[string]string{
		"message": "Status Ok",
	}
	jsonResp, err := json.Marshal(resp)
	if err != nil {
		log.Fatalf("Error happened in JSON marshal. Err: %s", err)
	}
	w.Write(jsonResp)
	return
}
