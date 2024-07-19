package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

var c3poJobBody = `{
	"job": {
	  "data": {
		"@type": "type.googleapis.com/google.protobuf.StringValue",
		"value": "C-3PO:Limb Calibration"
	  },
	  "dueTime": "30s"
	}
  }`

var r2d2JobBody = `{
	"job": {
	  "data": {
		"@type": "type.googleapis.com/google.protobuf.StringValue",
		"value": "R2-D2:Oil Change"
	  },
	  "dueTime": "2s"
	}
  }`

func main() {
	//Sleep for 5 seconds to wait for job-service to start
	time.Sleep(5 * time.Second)

	daprHost := os.Getenv("DAPR_HOST")
	if daprHost == "" {
		daprHost = "http://localhost"
	}

	schedulerDaprHttpPort := "6280"

	client := http.Client{
		Timeout: 15 * time.Second,
	}

	// Schedule a job using the Dapr Jobs API with short dueTime
	jobName := "R2-D2"
	reqURL := daprHost + ":" + schedulerDaprHttpPort + "/v1.0-alpha1/jobs/" + jobName

	req, err := http.NewRequest("POST", reqURL, strings.NewReader(r2d2JobBody))
	if err != nil {
		log.Fatal(err.Error())
	}

	req.Header.Set("Content-Type", "application/json")

	// Schedule a job using the Dapr Jobs API
	res, err := client.Do(req)
	if err != nil {
		log.Fatal(err)
	}

	if res.StatusCode != http.StatusNoContent {
		log.Fatalf("failed to register job event handler. status code: %v", res.StatusCode)
	}

	defer res.Body.Close()

	fmt.Println("Job Scheduled:", jobName)

	time.Sleep(5 * time.Second)

	// Schedule a job using the Dapr Jobs API with long dueTime
	jobName = "C-3PO"

	reqURL = daprHost + ":" + schedulerDaprHttpPort + "/v1.0-alpha1/jobs/" + jobName

	req, err = http.NewRequest("POST", reqURL, strings.NewReader(c3poJobBody))
	if err != nil {
		log.Fatal(err.Error())
	}

	req.Header.Set("Content-Type", "application/json")

	// Schedule a job using the Dapr Jobs API
	res, err = client.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer res.Body.Close()

	fmt.Println("Job Scheduled:", jobName)

	time.Sleep(5 * time.Second)

	// Gets a job using the Dapr Jobs API
	jobName = "C-3PO"
	reqURL = daprHost + ":" + schedulerDaprHttpPort + "/v1.0-alpha1/jobs/" + jobName

	res, err = http.Get(reqURL)
	if err != nil {
		log.Fatal(err.Error())
	}
	defer res.Body.Close()

	resBody, err := io.ReadAll(res.Body)
	if err != nil {
		log.Fatal(err.Error())

	}

	fmt.Println("Job details:", string(resBody))

	time.Sleep(5 * time.Second)
}
