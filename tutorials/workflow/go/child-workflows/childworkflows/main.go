// This tutorial shows child workflows in Go.
// An HTTP endpoint starts a parent workflow that starts one child workflow
// for each item of its input.
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

const appAddr = ":5259"

func main() {
	// The registry holds the workflows and activities of this app.
	r := workflow.NewRegistry()
	if err := r.AddWorkflow(ParentWorkflow); err != nil {
		log.Fatal(err)
	}
	if err := r.AddWorkflow(ChildWorkflow); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(Activity1); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(Activity2); err != nil {
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

	// POST /start schedules a new parent workflow instance. The request body
	// is a JSON array of strings, for example ["Item 1","Item 2"].
	mux := http.NewServeMux()
	mux.HandleFunc("POST /start", func(w http.ResponseWriter, req *http.Request) {
		var items []string
		if err := json.NewDecoder(req.Body).Decode(&items); err != nil {
			http.Error(w, "the request body must be a JSON array of strings", http.StatusBadRequest)
			return
		}
		instanceID, err := wfClient.ScheduleWorkflow(req.Context(), "ParentWorkflow",
			workflow.WithInput(items))
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
