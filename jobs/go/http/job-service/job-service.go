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
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

/*
dapr run --app-id job-app --app-port 5200 --dapr-http-port 5280 --log-level debug --scheduler-host-address=127.0.0.1:50006 -- go run .
*/

var jobMap = map[string]string{
	"R2-D2": "Oil Change",
	"C-3PO": "Memory Wipe",
	"BB-8":  "Internal Gyroscope Check",
}

type Job struct {
	TypeURL string `json:"type_url"`
	Value   string `json:"value"`
}

type DroidJob struct {
	Droid string `json:"droid"`
	Task  string `json:"task"`
}

func main() {
	appPort := os.Getenv("APP_PORT")
	if appPort == "" {
		appPort = "5280"
	}

	// Setup job handler
	http.HandleFunc("/job/", handleJob)

	fmt.Printf("Server started on port %v\n", appPort)
	err := http.ListenAndServe(":"+appPort, nil)
	if err != nil {
		log.Fatal(err)
	}

}

func handleJob(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Received job request...")
	rawBody, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("error reading request body: %v", err), http.StatusBadRequest)
		return
	}

	//fmt.Println("Raw request body:", string(rawBody))

	var jobData Job
	if err := json.Unmarshal(rawBody, &jobData); err != nil {
		http.Error(w, fmt.Sprintf("error decoding JSON: %v", err), http.StatusBadRequest)
		return
	}

	// Decoding job data
	decodedValue, err := base64.RawStdEncoding.DecodeString(jobData.Value)
	if err != nil {
		fmt.Printf("Error decoding base64: %v", err)
		http.Error(w, fmt.Sprintf("error decoding base64: %v", err), http.StatusBadRequest)
		return
	}

	//fmt.Println("decoded value:", string(decodedValue))

	// Creating Droid Job from decoded value
	droidJob := setDroidJob(string(decodedValue))

	fmt.Println("Starting droid:", droidJob.Droid)
	fmt.Println("Executing maintenance job:", droidJob.Task)

	w.WriteHeader(http.StatusOK)
}

func setDroidJob(decodedValue string) DroidJob {
	droidStr := strings.ReplaceAll(decodedValue, "\n", "")
	droidArray := strings.Split(droidStr, ":")

	droidJob := DroidJob{Droid: droidArray[0], Task: droidArray[1]}
	return droidJob
}

// func handleGetJob(w http.ResponseWriter, r *http.Request) {
// 	w.WriteHeader(http.StatusOK)

// }

// func handleDeleteJob(w http.ResponseWriter, r *http.Request) {
// 	w.WriteHeader(http.StatusOK)

// }
