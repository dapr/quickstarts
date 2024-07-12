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
	"time"

	daprc "github.com/dapr/go-sdk/client"

	"github.com/dapr/go-sdk/service/common"
	daprs "github.com/dapr/go-sdk/service/grpc"

	"google.golang.org/protobuf/types/known/anypb"
)

var daprClient daprc.Client

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
		{Name: "R2-D2", Jobs: []string{"Oil Change", "Circuitry Check"}},
		{Name: "C-3PO", Jobs: []string{"Memory Wipe", "Limb Calibration"}},
		{Name: "BB-8", Jobs: []string{"Internal Gyroscope Check", "Map Data Update"}},
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

	log.Println("starting server")
	go func() {
		if err = server.Start(); err != nil {
			log.Fatalf("failed to start server: %v", err)
		}
	}()

	//Create new Dapr client
	daprClient, err := daprc.NewClient()
	if err != nil {
		panic(err)
	}
	defer daprClient.Close()

	// Brief intermission to allow for the server to initialize.
	time.Sleep(10 * time.Second)

	// Setup handler and schedule jobs
	for _, droid := range droids {
		for _, job := range droid.Jobs {

			// create maintenance job
			maintenanceJob := MaintenanceJob{
				JobName:   droid.Name + " - " + job,
				DroidName: droid.Name,
				DroidJob:  job,
			}

			jobData, err := json.Marshal(maintenanceJob)
			if err != nil {
				log.Fatalf("failed to marshall job %v: %v", maintenanceJob.JobName, err)
			}

			// setup job event handler
			if err = server.AddJobEventHandler(maintenanceJob.JobName, droidMaintenanceHandler); err != nil {
				log.Fatalf("failed to register job event handler: %v", err)
			}

			ctx := context.Background()
			// schedule job
			scheduleJob(ctx, maintenanceJob, jobData)

			break

		}

		break
	}
}

func scheduleJob(ctx context.Context, maintenanceJob MaintenanceJob, jobData []byte) {
	// schedule job
	job := daprc.Job{
		Name:     maintenanceJob.JobName,
		Schedule: "@every 10s",
		Repeats:  10,
		TTL:      "60s",
		DueTime:  "1s",
		Data: &anypb.Any{
			Value: jobData,
		},
	}

	fmt.Printf("Scheduling job %+v\n", job)

	err := daprClient.ScheduleJobAlpha1(ctx, &job)
	if err != nil {
		fmt.Printf("failed to schedule job %v: %v", maintenanceJob.JobName, err)
	}

	fmt.Println("schedulejob - success")

	time.Sleep(3 * time.Second)
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
