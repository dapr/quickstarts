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

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"google.golang.org/protobuf/types/known/anypb"

	daprc "github.com/dapr/go-sdk/client"
)

/*
dapr run --app-id maintenance-scheduler --app-port 5200 --dapr-http-port 5280 --dapr-grpc-port 5281 --scheduler-host-address=127.0.0.1:50006 -- go run .
*/

var daprClient daprc.Client
var err error

// Define a Droid struct
type Droid struct {
	Name string
	Jobs []string
}

type DroidJob struct {
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

	//Create new Dapr client
	daprClient, err = daprc.NewClient()
	if err != nil {
		panic(err)
	}
	defer daprClient.Close()

	//Schedule jobs
	for _, droid := range droids {
		for _, job := range droid.Jobs {

			//create maintenance job
			droidJob := DroidJob{
				DroidName: droid.Name,
				DroidJob:  job,
			}

			jobData, err := json.Marshal(droidJob)
			if err != nil {
				log.Fatalf("failed to marshall job %v: %v", droidJob.DroidJob, err)
			}

			ctx := context.Background()
			//schedule job
			scheduleJob(ctx, droidJob, jobData)

		}
	}
}

func scheduleJob(ctx context.Context, droidJob DroidJob, jobData []byte) {
	// schedule job
	job := daprc.Job{
		Name:     droidJob.DroidName,
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
		fmt.Printf("failed to schedule job for %v: %v", droidJob.DroidName, err)
	}

	fmt.Println("schedulejob - success")

	time.Sleep(3 * time.Second)
}
