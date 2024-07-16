/*
Copyright 2021 The Dapr Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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

	// Brief intermission to allow for the server to initialize.
	//time.Sleep(5 * time.Second)

}

func droidMaintenanceHandler(ctx context.Context, job *common.JobEvent) error {
	fmt.Println("Received job event")
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
