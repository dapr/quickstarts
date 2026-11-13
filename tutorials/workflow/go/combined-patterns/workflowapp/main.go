// This tutorial combines workflow patterns in Go: fan-out/fan-in, task
// chaining, an external event and compensation. This app runs the order
// workflow. It uses the state, service invocation, and pub/sub APIs of Dapr.
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

	"github.com/dapr/durabletask-go/workflow"
	"github.com/dapr/go-sdk/client"
)

const appAddr = ":5260"

// CloudEvent is the envelope of a pub/sub message. The message is in Data.
type CloudEvent struct {
	Data json.RawMessage `json:"data"`
}

func main() {
	// The registry holds the workflows and activities of this app.
	r := workflow.NewRegistry()
	if err := r.AddWorkflow(OrderWorkflow); err != nil {
		log.Fatal(err)
	}
	for _, activity := range []workflow.Activity{
		CheckInventory, CheckShippingDestination, ProcessPayment,
		UpdateInventory, RegisterShipment, ReimburseCustomer,
	} {
		if err := r.AddActivity(activity); err != nil {
			log.Fatal(err)
		}
	}

	// The Dapr client calls the state, service invocation, and pub/sub APIs.
	var err error
	daprClient, err = client.NewClient()
	if err != nil {
		log.Fatalf("failed to create the Dapr client: %v", err)
	}
	defer daprClient.Close()

	// The workflow client manages workflows. StartWorker connects the app to
	// the Dapr sidecar and runs the workflows and activities of the registry.
	wfClient, err := client.NewWorkflowClient()
	if err != nil {
		log.Fatalf("failed to create the workflow client: %v", err)
	}

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	if err := wfClient.StartWorker(ctx, r); err != nil {
		log.Fatalf("failed to start the workflow worker: %v", err)
	}

	mux := http.NewServeMux()

	// POST /start schedules a new workflow instance. The order ID is the
	// instance ID. createDefaultInventory makes sure that there is enough
	// inventory for the order.
	mux.HandleFunc("POST /start", func(w http.ResponseWriter, req *http.Request) {
		var order Order
		if err := json.NewDecoder(req.Body).Decode(&order); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if err := createDefaultInventory(req.Context()); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		log.Printf("start: Received input: %+v", order)

		instanceID, err := wfClient.ScheduleWorkflow(req.Context(), "OrderWorkflow",
			workflow.WithInput(order), workflow.WithInstanceID(order.ID))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusAccepted)
		_ = json.NewEncoder(w).Encode(map[string]string{"instance_id": instanceID})
	})

	// POST /shipmentRegistered handles the messages of the
	// shipment-registration-confirmed-events topic (see
	// resources/subscription-workflow.yaml). It raises an event on the
	// workflow instance to tell it that the shipping app registered the
	// shipment.
	mux.HandleFunc("POST /shipmentRegistered", func(w http.ResponseWriter, req *http.Request) {
		var event CloudEvent
		if err := json.NewDecoder(req.Body).Decode(&event); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		var status ShipmentRegistrationStatus
		if err := json.Unmarshal(event.Data, &status); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		log.Printf("shipmentRegistered: Received input: %+v", status)

		if err := wfClient.RaiseEvent(req.Context(), status.OrderID, shipmentRegisteredEvent,
			workflow.WithEventPayload(status)); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusAccepted)
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
