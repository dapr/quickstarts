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

	daprc "github.com/dapr/go-sdk/client"
)

type DroidJob struct {
	Name    string `json:"name"`
	Job     string `json:"job"`
	DueTime string `json:"dueTime"`
}

type App struct {
	daprClient daprc.Client
}

var app App

func main() {
	// Waiting 15 seconds for the job-service to start
	time.Sleep(15 * time.Second)

	droidJobs := []DroidJob{
		{Name: "R2-D2", Job: "Oil Change", DueTime: "5s"},
		{Name: "C-3PO", Job: "Memory Wipe", DueTime: "15s"},
		{Name: "BB-8", Job: "Internal Gyroscope Check", DueTime: "30s"},
	}

	//Create new Dapr client
	daprClient, err := daprc.NewClient()
	if err != nil {
		panic(err)
	}
	defer daprClient.Close()

	app = App{
		daprClient: daprClient,
	}

	// Schedule R2-D2 job
	err = schedule(droidJobs[0])
	if err != nil {
		log.Fatalln("Error scheduling job: ", err)
	}

	// Schedule C-3PO job
	err = schedule(droidJobs[1])
	if err != nil {
		log.Fatalln("Error scheduling job: ", err)
	}

	// Get C-3PO job
	resp, err := get(droidJobs[1])
	if err != nil {
		log.Fatalln("Error retrieving job: ", err)
	}
	fmt.Println("Get job response: ", resp)

	// Schedule BB-8 job
	err = schedule(droidJobs[2])
	if err != nil {
		log.Fatalln("Error scheduling job: ", err)
	}

	// Get BB-8 job
	resp, err = get(droidJobs[2])
	if err != nil {
		log.Fatalln("Error retrieving job: ", err)
	}
	fmt.Println("Get job response: ", resp)

	// Delete BB-8 job
	err = delete(droidJobs[2])
	if err != nil {
		log.Fatalln("Error deleting job: ", err)
	}
	fmt.Println("Job deleted: ", droidJobs[2].Name)

	//time.Sleep(15 * time.Second)
}

// Schedules a job by invoking grpc service from job-service passing a DroidJob as an argument
func schedule(droidJob DroidJob) error {
	jobData, err := json.Marshal(droidJob)
	if err != nil {
		fmt.Println("Error marshalling job content")
		return err
	}

	content := &daprc.DataContent{
		ContentType: "application/json",
		Data:        []byte(jobData),
	}

	// Schedule Job
	_, err = app.daprClient.InvokeMethodWithContent(context.Background(), "job-service-sdk", "scheduleJob", "POST", content)
	if err != nil {
		fmt.Println("Error invoking method: ", err)
		return err
	}

	return nil
}

// Gets a job by invoking grpc service from job-service passing a job name as an argument
func get(droidJob DroidJob) (string, error) {
	content := &daprc.DataContent{
		ContentType: "text/plain",
		Data:        []byte(droidJob.Name),
	}

	//get job
	resp, err := app.daprClient.InvokeMethodWithContent(context.Background(), "job-service", "getJob", "GET", content)
	if err != nil {
		fmt.Println("Error invoking method: ", err)
		return "", err
	}

	return string(resp), nil
}

// Deletes a job by invoking grpc service from job-service passing a job name as an argument
func delete(droidJob DroidJob) error {
	content := &daprc.DataContent{
		ContentType: "text/plain",
		Data:        []byte(droidJob.Name),
	}

	_, err := app.daprClient.InvokeMethodWithContent(context.Background(), "job-service", "deleteJob", "DELETE", content)
	if err != nil {
		fmt.Println("Error invoking method: ", err)
		return err
	}

	return nil
}
