package main

/*
dapr run --app-id maintenance-scheduler --app-port 5200 --dapr-http-port 5280 --dapr-grpc-port 5281 --scheduler-host-address=127.0.0.1:50006 -- go run .
*/

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/dapr/go-sdk/service/common"
	daprs "github.com/dapr/go-sdk/service/grpc"
)

//var daprClient daprc.Client

// Define a Droid struct
type Droid struct {
	Name string
	Jobs []string
}

type MaintenanceJob struct {
	JobName   string
	DroidName string
	DroidJob  string
}

func main() {

	// Define the droids and their maintenance jobs
	droids := []Droid{
		{Name: "R2-D2", Jobs: []string{"Oil Change"}},
		{Name: "C-3PO", Jobs: []string{"Memory Wipe"}},
		{Name: "BB-8", Jobs: []string{"Internal Gyroscope Check"}},
	}

	appPort := os.Getenv("APP_PORT")
	if appPort == "" {
		appPort = "5280"
	}

	// Create a new Dapr service
	server, err := daprs.NewService(":" + appPort)
	if err != nil {
		log.Fatalf("failed to start the server: %v", err)
	}

	for _, droid := range droids {
		// setup job event handler
		if err = server.AddJobEventHandler(droid.Name, droidMaintenanceHandler); err != nil {
			log.Fatalf("failed to register job event handler: %v", err)
		}

		fmt.Println("Handler created for ", droid.Name)
	}

	log.Println("starting server")
	if err = server.Start(); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}

}

func droidMaintenanceHandler(ctx context.Context, job *common.JobEvent) error {
	var jobData common.Job
	if err := json.Unmarshal(job.Data, &jobData); err != nil {
		return fmt.Errorf("failed to unmarshal job: %v", err)
	}
	decodedPayload, err := base64.StdEncoding.DecodeString(jobData.Value)
	if err != nil {
		return fmt.Errorf("failed to decode job payload: %v", err)
	}
	var jobPayload MaintenanceJob
	if err := json.Unmarshal(decodedPayload, &jobPayload); err != nil {
		return fmt.Errorf("failed to unmarshal payload: %v", err)
	}
	fmt.Printf("Maintenance job %v received:\n type: %v \n typeurl: %v\n value: %v\n extracted payload: %v\n", jobPayload.JobName, job.JobType, jobData.TypeURL, jobData.Value, jobPayload)
	return nil
}
