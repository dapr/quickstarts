// This tutorial shows the monitor pattern in Go.
// An HTTP endpoint starts a workflow that checks a status in a loop.
package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/dapr/durabletask-go/workflow"
	"github.com/dapr/go-sdk/client"
)

const appAddr = ":5257"

func main() {
	// The registry holds the workflows and activities of this app.
	r := workflow.NewRegistry()
	if err := r.AddWorkflow(MonitorWorkflow); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(CheckStatus); err != nil {
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

	// POST /start/{counter} schedules a new workflow instance. The counter is
	// the input of the workflow.
	mux := http.NewServeMux()
	mux.HandleFunc("POST /start/{counter}", func(w http.ResponseWriter, req *http.Request) {
		counter, err := strconv.Atoi(req.PathValue("counter"))
		if err != nil {
			http.Error(w, "the counter must be an integer", http.StatusBadRequest)
			return
		}
		instanceID, err := wfClient.ScheduleWorkflow(req.Context(), "MonitorWorkflow",
			workflow.WithInput(counter))
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
