// This tutorial shows how to manage workflow instances in Go.
// HTTP endpoints start, query, suspend, resume, terminate, and purge a workflow.
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

const appAddr = ":5262"

func main() {
	// The registry holds the workflows and activities of this app.
	r := workflow.NewRegistry()
	if err := r.AddWorkflow(NeverEndingWorkflow); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(SendNotification); err != nil {
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

	mux := http.NewServeMux()

	// POST /start/{counter} schedules a new workflow instance.
	mux.HandleFunc("POST /start/{counter}", func(w http.ResponseWriter, req *http.Request) {
		counter, err := strconv.Atoi(req.PathValue("counter"))
		if err != nil {
			http.Error(w, "counter must be an integer", http.StatusBadRequest)
			return
		}
		instanceID, err := wfClient.ScheduleWorkflow(req.Context(), "NeverEndingWorkflow",
			workflow.WithInput(counter))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		writeJSON(w, http.StatusAccepted, map[string]string{"instance_id": instanceID})
	})

	// GET /status/{instance_id} returns the state of a workflow instance.
	mux.HandleFunc("GET /status/{instance_id}", func(w http.ResponseWriter, req *http.Request) {
		meta, err := wfClient.FetchWorkflowMetadata(req.Context(), req.PathValue("instance_id"),
			workflow.WithFetchPayloads(true))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{
			"instance_id":       meta.InstanceId,
			"name":              meta.Name,
			"runtime_status":    meta.String(),
			"created_at":        meta.CreatedAt.AsTime(),
			"last_updated_at":   meta.LastUpdatedAt.AsTime(),
			"serialized_input":  meta.Input.GetValue(),
			"serialized_output": meta.Output.GetValue(),
		})
	})

	// POST /suspend/{instance_id} pauses the instance. It keeps its state.
	mux.HandleFunc("POST /suspend/{instance_id}", func(w http.ResponseWriter, req *http.Request) {
		err := wfClient.SuspendWorkflow(req.Context(), req.PathValue("instance_id"), "suspended by the tutorial")
		respond(w, err)
	})

	// POST /resume/{instance_id} resumes a suspended instance.
	mux.HandleFunc("POST /resume/{instance_id}", func(w http.ResponseWriter, req *http.Request) {
		err := wfClient.ResumeWorkflow(req.Context(), req.PathValue("instance_id"), "resumed by the tutorial")
		respond(w, err)
	})

	// POST /terminate/{instance_id} stops the instance for good.
	mux.HandleFunc("POST /terminate/{instance_id}", func(w http.ResponseWriter, req *http.Request) {
		err := wfClient.TerminateWorkflow(req.Context(), req.PathValue("instance_id"))
		respond(w, err)
	})

	// DELETE /purge/{instance_id} deletes the state of a finished instance.
	mux.HandleFunc("DELETE /purge/{instance_id}", func(w http.ResponseWriter, req *http.Request) {
		err := wfClient.PurgeWorkflowState(req.Context(), req.PathValue("instance_id"))
		respond(w, err)
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

// respond answers 202 when the call worked, and 500 with the error otherwise.
func respond(w http.ResponseWriter, err error) {
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusAccepted)
}

func writeJSON(w http.ResponseWriter, code int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(body)
}
