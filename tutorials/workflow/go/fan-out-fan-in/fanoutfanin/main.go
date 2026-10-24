// This tutorial shows the fan-out/fan-in pattern of a Dapr workflow in Go.
// An HTTP endpoint starts a workflow that calls one activity for each word of
// its input, at the same time, and returns the shortest word.
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

const appAddr = ":5256"

func main() {
	// The registry holds the workflows and activities of this app.
	r := workflow.NewRegistry()
	if err := r.AddWorkflow(FanOutFanInWorkflow); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(GetWordLength); err != nil {
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

	// POST /start schedules a new workflow instance. The request body is a JSON
	// array of strings, the input of the workflow.
	mux := http.NewServeMux()
	mux.HandleFunc("POST /start", func(w http.ResponseWriter, req *http.Request) {
		var words []string
		if err := json.NewDecoder(req.Body).Decode(&words); err != nil {
			http.Error(w, "the body must be a JSON array of strings", http.StatusBadRequest)
			return
		}
		instanceID, err := wfClient.ScheduleWorkflow(req.Context(), "FanOutFanInWorkflow",
			workflow.WithInput(words))
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
