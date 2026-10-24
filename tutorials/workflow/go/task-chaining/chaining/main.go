// This tutorial shows the task chaining pattern in Go.
// An HTTP endpoint starts a workflow that calls three activities in sequence.
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

const appAddr = ":5255"

func main() {
	// The registry holds the workflows and activities of this app.
	r := workflow.NewRegistry()
	if err := r.AddWorkflow(ChainingWorkflow); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(Activity1); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(Activity2); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(Activity3); err != nil {
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

	// POST /start schedules a new workflow instance with the input "This".
	mux := http.NewServeMux()
	mux.HandleFunc("POST /start", func(w http.ResponseWriter, req *http.Request) {
		instanceID, err := wfClient.ScheduleWorkflow(req.Context(), "ChainingWorkflow",
			workflow.WithInput("This"))
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
