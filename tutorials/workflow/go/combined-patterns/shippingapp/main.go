// This app is the supporting service of the combined patterns tutorial. The
// order workflow calls it with service invocation (checkDestination) and with
// pub/sub (registerShipment).
package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/dapr/go-sdk/client"
)

const (
	appAddr = ":5261"

	pubsubComponent      = "shippingpubsub"
	pubsubConfirmedTopic = "shipment-registration-confirmed-events"
)

// CustomerInfo identifies the customer of an order.
type CustomerInfo struct {
	ID      string `json:"id"`
	Country string `json:"country"`
}

// Order is the message that the workflow app publishes. The shipping app
// only needs the order ID and the customer.
type Order struct {
	ID           string       `json:"id"`
	CustomerInfo CustomerInfo `json:"customer_info"`
}

// ShippingDestinationResult is the answer to the destination check.
type ShippingDestinationResult struct {
	IsSuccess bool   `json:"is_success"`
	Message   string `json:"message,omitempty"`
}

// ShipmentRegistrationStatus is the message that this app publishes when it
// has registered the shipment.
type ShipmentRegistrationStatus struct {
	OrderID   string `json:"order_id"`
	IsSuccess bool   `json:"is_success"`
	Message   string `json:"message,omitempty"`
}

// CloudEvent is the envelope of a pub/sub message. The message is in Data.
type CloudEvent struct {
	Data Order `json:"data"`
}

func main() {
	daprClient, err := client.NewClient()
	if err != nil {
		log.Fatalf("failed to create the Dapr client: %v", err)
	}
	defer daprClient.Close()

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	mux := http.NewServeMux()

	// POST /checkDestination answers the service invocation of the workflow.
	mux.HandleFunc("POST /checkDestination", func(w http.ResponseWriter, req *http.Request) {
		var customer CustomerInfo
		if err := json.NewDecoder(req.Body).Decode(&customer); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		log.Printf("checkDestination: Received input: %+v.", customer)
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(ShippingDestinationResult{IsSuccess: true})
	})

	// POST /registerShipment handles the messages of the
	// shipment-registration-events topic (see resources/subscription-shipping.yaml).
	// It publishes the confirmation to the shipment-registration-confirmed-events topic.
	mux.HandleFunc("POST /registerShipment", func(w http.ResponseWriter, req *http.Request) {
		var event CloudEvent
		if err := json.NewDecoder(req.Body).Decode(&event); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		order := event.Data
		log.Printf("registerShipment: Received input: %+v.", order)

		status := ShipmentRegistrationStatus{OrderID: order.ID, IsSuccess: true}
		if err := daprClient.PublishEvent(req.Context(), pubsubComponent, pubsubConfirmedTopic, status); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
	})

	srv := &http.Server{Addr: appAddr, Handler: mux}
	go func() {
		<-ctx.Done()
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer shutdownCancel()
		_ = srv.Shutdown(shutdownCtx)
	}()

	log.Printf("listening on %s", appAddr)
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}
