// This tutorial shows the external system interaction pattern in Go.
// An HTTP endpoint starts a workflow that waits for an approval event.
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

const appAddr = ":5258"

func main() {
	// The registry holds the workflows and activities of this app.
	r := workflow.NewRegistry()
	if err := r.AddWorkflow(ExternalEventsWorkflow); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(RequestApproval); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(SendNotification); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(ProcessOrder); err != nil {
		log.Fatal(err)
	}

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

	// POST /start schedules a new workflow instance. The order ID is the
	// instance ID.
	mux := http.NewServeMux()
	mux.HandleFunc("POST /start", func(w http.ResponseWriter, req *http.Request) {
		var order Order
		if err := json.NewDecoder(req.Body).Decode(&order); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		log.Printf("Received order: %+v", order)

		instanceID, err := wfClient.ScheduleWorkflow(req.Context(), "ExternalEventsWorkflow",
			workflow.WithInput(order), workflow.WithInstanceID(order.ID))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusAccepted)
		_ = json.NewEncoder(w).Encode(map[string]string{"instance_id": instanceID})
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
