// This tutorial shows retry policies and compensation in Go.
// An HTTP endpoint starts a workflow with an integer input. The workflow retries
// a failing activity and then runs a compensating activity.
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

const appAddr = ":5264"

func main() {
	// The registry holds the workflows and activities of this app.
	r := workflow.NewRegistry()
	if err := r.AddWorkflow(ResiliencyAndCompensationWorkflow); err != nil {
		log.Fatal(err)
	}
	for _, activity := range []workflow.Activity{MinusOne, Division, PlusOne} {
		if err := r.AddActivity(activity); err != nil {
			log.Fatal(err)
		}
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

	// POST /start/{input} schedules a new workflow instance with the integer input.
	mux := http.NewServeMux()
	mux.HandleFunc("POST /start/{input}", func(w http.ResponseWriter, req *http.Request) {
		input, err := strconv.Atoi(req.PathValue("input"))
		if err != nil {
			http.Error(w, "the input must be an integer", http.StatusBadRequest)
			return
		}
		instanceID, err := wfClient.ScheduleWorkflow(req.Context(), "ResiliencyAndCompensationWorkflow",
			workflow.WithInput(input))
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
