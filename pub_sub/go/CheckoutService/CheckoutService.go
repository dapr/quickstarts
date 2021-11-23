// package main

// import (
// 	"encoding/json"
// 	"log"
// 	"net/http"

// 	"github.com/gorilla/mux"
// )

// func getCheckout(w http.ResponseWriter, r *http.Request) {
// 	w.Header().Set("Content-Type", "application/json")
// 	vars := mux.Vars(r)
// 	orderId := vars["orderId"]
// 	log.Println("Checked out order id : " + orderId)
// 	obj, err := json.Marshal("CID" + orderId)
// 	if err != nil {
// 		log.Println("Error in reading the result obj")
// 	}
// 	w.Write(obj)
// }

// func main() {
// 	r := mux.NewRouter()
// 	r.HandleFunc("/checkout/{orderId}", getCheckout).Methods("GET")
// 	http.ListenAndServe(":6002", r)
// }

package main

import (
	"log"
	"net/http"
	"context"

	"github.com/dapr/go-sdk/service/common"
	daprd "github.com/dapr/go-sdk/service/http"
)

var sub = &common.Subscription{
	PubsubName: "order_pub_sub",
	Topic:      "orders",
	Route:      "/checkout",
}

func main() {
	s := daprd.NewService(":6002")
	if err := s.AddTopicEventHandler(sub, eventHandler); err != nil {
		log.Fatalf("error adding topic subscription: %v", err)
	}
	if err := s.Start(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("error listenning: %v", err)
	}
}

func eventHandler(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
	log.Printf("Subscriber received: %s", e.Data)
	return false, nil
}